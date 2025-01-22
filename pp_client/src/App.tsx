import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import './App.css';
import BlockCoordsComponent from './components/BlockCoordsComponent';
import BuffCoordsComponent from './components/BuffCoordsComponent';
import { IBuffValsProps } from './components/IBuffValsProps';
import { IBlockPlanar, ICoordPlanar } from './components/ICoordPlanar';
import PickerComponent from './components/PickerComponent';
import { CoordUtil } from './util/CoordUtil';

const appTheme = createTheme({
  palette: {
    // mode: 'dark',
  },
  typography: {
    fontFamily: [
      'SimplyMono-Bold',
    ].join(','),
    button: {
      textTransform: 'none'
    }
  },
  components: {
    MuiStack: {
      defaultProps: {
        spacing: 2
      }
    },
    MuiCard: {
      defaultProps: {
        elevation: 3
      },
      styleOverrides: {
        root: {
          margin: '6px',
          padding: '12px'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          margin: '6px'
        }
      }
    }
  }
});

function App() {

  const [monoCoords, setMonoCoords] = useState<IBlockPlanar[]>([]);

  const [cmdDestProps, setCmdDestProps] = useState<IBuffValsProps[]>([]);
  const handleDeviceRemove = (device: BluetoothDevice) => {
    setCmdDestProps([
      ...cmdDestProps.filter(props => props.device.id !== device.id)
    ]);
  };

  const handleDevicePicked = (device: BluetoothDevice) => {
    const hasDevice = cmdDestProps.find(props => props.device.id === device.id);
    if (!hasDevice) {
      setCmdDestProps([
        ...cmdDestProps,
        {
          monoCoords,
          device,
          handleDeviceRemove
        }
      ]);
    } else {
      // TODO :: show some message
    }
  };



  useEffect(() => {

    console.debug('✨ building App');

    fetch("hirschkaefer.gcode").then((res) => res.text()).then((text) => {

      // const penZU = 0.0;
      // const penZD = -8.0;

      const _fileCoords: ICoordPlanar[] = [];

      const lines: string[] = text.split('\n');
      let line: String;
      let xLast = 0;
      let yLast = 0;
      let zLast = CoordUtil.PEN_Z_U;

      for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {

        line = lines[lineIndex];
        if (line.indexOf('X') >= 0 && line.indexOf('Y') >= 0) {
          // console.log(line);
          const isMove = line.startsWith('G00 F');
          const isDraw = line.startsWith('G01 F');
          if (isMove || isDraw) {

            const xCurr = parseFloat(line.substring(line.indexOf('X') + 1, line.indexOf('Y')).trim());
            const yCurr = parseFloat(line.substring(line.indexOf('Y') + 1, line.indexOf(';')).trim());
            const zCurr = isMove ? CoordUtil.PEN_Z_U : CoordUtil.PEN_Z_D;

            if (zLast !== zCurr) { // up or down, if not in the correct position
              _fileCoords.push({
                x1: xLast,
                y1: yLast,
                z1: zCurr
              });
            }
            _fileCoords.push({
              x1: xCurr,
              y1: yCurr,
              z1: zCurr
            });

            xLast = xCurr;
            yLast = yCurr;
            zLast = zCurr;
          }
        }

      }

      if (zLast !== CoordUtil.PEN_Z_U) {
        _fileCoords.push({
          x1: xLast,
          y1: yLast,
          z1: CoordUtil.PEN_Z_U
        });
        zLast = CoordUtil.PEN_Z_U;
      }

      // setup junction speed calculation
      let dotAB: number;

      // copies of file-vals + extra values
      const _blockCoords: IBlockPlanar[] = _fileCoords.map(fileVal => {
        return {
          ...fileVal,
          x0: 0,
          y0: 0,
          z0: 0,
          l: 0,
          vi: CoordUtil.MIN_MMS,
          vo: CoordUtil.MIN_MMS,
          bb: false
        }
      });

      // copy over target coord of the previous elements as source coord to the next element
      for (let index = 1; index < _blockCoords.length; index++) {
        _blockCoords[index].x0 = _blockCoords[index - 1].x1;
        _blockCoords[index].y0 = _blockCoords[index - 1].y1;
        _blockCoords[index].z0 = _blockCoords[index - 1].z1;
      }

      for (let index = 0; index < _blockCoords.length; index++) {
        _blockCoords[index].l = CoordUtil.blockLen(_blockCoords[index]);
      }

      // max-junction speed calculation
      for (let index = 0; index < _fileCoords.length - 1; index++) {
        dotAB = 1 - Math.min(CoordUtil.SEMI_PI, Math.acos(CoordUtil.blockDot(CoordUtil.toUnitBlock(_blockCoords[index]), CoordUtil.toUnitBlock(_blockCoords[index + 1])))) / CoordUtil.SEMI_PI;
        _blockCoords[index].vo = Math.max(CoordUtil.MIN_MMS, dotAB * CoordUtil.MAX_MMS);
        _blockCoords[index + 1].vi = Math.max(CoordUtil.MIN_MMS, dotAB * CoordUtil.MAX_MMS);
      }

      // iterate backwards and reduce exit speed on blocks where entry speed is too high for deceleration within the block
      for (let index = _blockCoords.length - 1; index > 0; index--) {

        // deceleration
        if (_blockCoords[index].vo < _blockCoords[index].vi) {

          let lViToVo = (_blockCoords[index].vo * _blockCoords[index].vo - _blockCoords[index].vi * _blockCoords[index].vi) / (2 * -CoordUtil.MAX_ACC);
          if (lViToVo > _blockCoords[index].l) {

            // console.log('trim vi (1)', index, 'lViToVo', lViToVo.toFixed(3).padStart(7, ' '), 'l', _blockCoords[index].l.toFixed(3).padStart(7, ' '));

            // calculate max entry speed, given distance and exit-speed
            const vI = Math.sqrt(_blockCoords[index].l * 2 * CoordUtil.MAX_ACC + _blockCoords[index].vo * _blockCoords[index].vo);

            _blockCoords[index].vi = vI;
            _blockCoords[index - 1].vo = vI;
            // console.log('trim vi (-)', vI.toFixed(3).padStart(7, ' '));

            // control
            lViToVo = (_blockCoords[index].vo * _blockCoords[index].vo - _blockCoords[index].vi * _blockCoords[index].vi) / (2 * -CoordUtil.MAX_ACC);
            // console.log('trim vi (2)', index, 'lViToVo', lViToVo.toFixed(3).padStart(7, ' '), 'l', _blockCoords[index].l.toFixed(3).padStart(7, ' '));

          }

        }

      }

      for (let index = 0; index < _blockCoords.length - 1; index++) {

        // acceleration
        if (_blockCoords[index].vo > _blockCoords[index].vi) {

          let lViToVo = (_blockCoords[index].vo * _blockCoords[index].vo - _blockCoords[index].vi * _blockCoords[index].vi) / (2 * CoordUtil.MAX_ACC);
          if (lViToVo > _blockCoords[index].l) {

            // console.log('trim vo (1)', index, 'lViToVo', lViToVo.toFixed(3).padStart(7, ' '), 'l', _blockCoords[index].l.toFixed(3).padStart(7, ' '));

            // calculate max exit speed, given distance and entry-speed
            const vO = Math.sqrt(_blockCoords[index].l * 2 * CoordUtil.MAX_ACC + _blockCoords[index].vi * _blockCoords[index].vi);

            _blockCoords[index].vo = vO;
            _blockCoords[index + 1].vi = vO;
            // console.log('trim vo (-)', vO.toFixed(3).padStart(7, ' '), 'was', _blockCoords[index].vo);

            // control
            lViToVo = (_blockCoords[index].vo * _blockCoords[index].vo - _blockCoords[index].vi * _blockCoords[index].vi) / (2 * CoordUtil.MAX_ACC);
            // console.log('trim vo (2)', index, 'lViToVo', lViToVo.toFixed(3).padStart(7, ' '), 'l', _blockCoords[index].l.toFixed(3).padStart(7, ' '));


          }

        }

      }

      const _monoCoords: IBlockPlanar[] = [];

      if (_blockCoords?.length > 1) {

        // let _dX = 0;
        // const sX = 20;
        // const sY = 8;
        // let _d0 = `M 0 ${dY}`;
        // let _d1 = `M 0 ${dY}`;
        // let _d2 = `M 0 ${dY}`;
        // let _d3 = `M 0 ${dY - 250}`;

        for (let index = 0; index < _blockCoords.length; index++) {

          // faster z-acceleration
          const acc = _blockCoords[index].x0 !== _blockCoords[index].x1 || _blockCoords[index].y0 !== _blockCoords[index].y1 ? CoordUtil.MAX_ACC : CoordUtil.PEN_ACC * 5;

          // distance travelled while accelerating from entry to full
          const lViToVm = (CoordUtil.MAX_MMS * CoordUtil.MAX_MMS - _blockCoords[index].vi * _blockCoords[index].vi) / (2 * acc);

          // distance travelled while decelarating from full to exit
          const lVmToVo = (_blockCoords[index].vo * _blockCoords[index].vo - CoordUtil.MAX_MMS * CoordUtil.MAX_MMS) / (2 * -acc);

          const lViToVmToVo = lViToVm + lVmToVo;
          if (lViToVmToVo < _blockCoords[index].l) { // needs an extra full speed segment

            const lDiff = (_blockCoords[index].l - lViToVmToVo);
            // console.log('full speed is reachable'.padEnd(35, ' '), index, 'lDiff', lDiff.toFixed(3).padStart(7, ' '), 'l', blockCoords[index].l.toFixed(3).padStart(7, ' '));

            _monoCoords.push(CoordUtil.toMultBlock(_blockCoords[index], 0, lViToVm, _blockCoords[index].vi, CoordUtil.MAX_MMS)); // accelerate
            _monoCoords.push(CoordUtil.toMultBlock(_blockCoords[index], lViToVm, lViToVm + lDiff, CoordUtil.MAX_MMS, CoordUtil.MAX_MMS)); // full speed
            _monoCoords.push(CoordUtil.toMultBlock(_blockCoords[index], lViToVm + lDiff, _blockCoords[index].l, CoordUtil.MAX_MMS, _blockCoords[index].vo)); // decelerate
            _monoCoords[_monoCoords.length - 1].bb = true;

          } else { // can not reach full speed, in and out must be shortened

            // overshoot length both on acceleration and deceleration side
            const lDiff = (lViToVmToVo - _blockCoords[index].l) / 2;
            // console.log('full speed is not reachable'.padEnd(35, ' '), index, 'lDiff', lDiff.toFixed(3).padStart(7, ' '), 'l', blockCoords[index].l.toFixed(3).padStart(7, ' '));

            const vS = Math.sqrt((lViToVm - lDiff) * 2 * acc + _blockCoords[index].vi * _blockCoords[index].vi);

            const blockA = CoordUtil.toMultBlock(_blockCoords[index], 0, lViToVm - lDiff, _blockCoords[index].vi, vS);
            if (blockA.l > 0.001) {
              _monoCoords.push(blockA); // accelerate
            }
            const blockB = CoordUtil.toMultBlock(_blockCoords[index], lViToVm - lDiff, _blockCoords[index].l, vS, _blockCoords[index].vo);
            if (blockB.l > 0.001) {
              _monoCoords.push(blockB); // decelerate
            }
            _monoCoords[_monoCoords.length - 1].bb = true;

          }

        }

        // console.log('-----------------------------------------------------------------');

        // _dX = 0;
        // let _maxSecond = 0;
        // for (let index = 0; index < _monoCoords.length; index++) {

        //     _d1 += `L${_dX} ${dY - _monoCoords[index].vi * sY}`;
        //     // _d3 += `M${_dX} ${dY - _monoCoords[index].z1 * 3 - 200}`; // z-indicator


        //     const vBlock = (_monoCoords[index].vo + _monoCoords[index].vi) / 2;
        //     const tBlock = _monoCoords[index].l / vBlock;
        //     _maxSecond += tBlock;

        //     _dX += tBlock * sX;

        //     _d1 += `L${_dX} ${dY - _monoCoords[index].vo * sY}`;
        //     _d3 += `L${_dX} ${dY - _monoCoords[index].z1 * 3 - 250}`; // z-indicator

        //     if (_monoCoords[index].bb) {
        //         _d0 += `M${_dX} 0`;
        //         _d0 += `L${_dX} ${dY}`;
        //     }

        //     // doublecheck on acceleration
        //     const aA = (_monoCoords[index].vo * _monoCoords[index].vo - _monoCoords[index].vi * _monoCoords[index].vi) * 0.5 / _monoCoords[index].l;
        //     console.log(`aA (${index})`, aA.toFixed(3).padStart(7, ' '));

        // }

        // for (let second = 0; second < _maxSecond; second += 1) {
        //     _dX = second * sX;
        //     _d2 += `M${_dX} 0`;
        //     _d2 += `L${_dX} ${dY}`;
        // }
        // _dX = _maxSecond * sX;




        // // horizontal line at max speed
        // _d2 += `M${0} ${dY - CoordUtil.MAX_MMS * sY}`;;
        // _d2 += `L${_dX} ${dY - CoordUtil.MAX_MMS * sY}`;

        // console.log('_d', _d1);
        // console.log('-----------------------------------------------------------------');
        console.log('_monoCoords', _monoCoords);
        setMonoCoords(_monoCoords);
        // setDX(_dX);
        // setD0(_d0);
        // setD1(_d1);
        // setD2(_d2);
        // setD3(_d3);
        // setMaxSecond(`${_maxSecond}s`);

      }

      // console.log('_blockVals', _blockVals);
      // setFileVals(_blockCoords);

    }).catch((e) => console.error(e));

  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h5" component="h5" sx={{ paddingLeft: '10px' }}>
          <PickerComponent {...{ handleDevicePicked }} />
        </Typography>
        <BlockCoordsComponent {...{
          monoCoords: monoCoords
        }}></BlockCoordsComponent>
        {
          cmdDestProps.map(device => <BuffCoordsComponent key={device.device.id} {...device} />)
        }

        {/* <Grid container spacing={2} >
          <Grid item xs={6}>
            <TextInputComponent {...textInputProps} />
          </Grid>
          <Grid item xs={6}>
            <TextOutputComponent {...textInputProps} />
          </Grid>
        </Grid> */}
      </div>

    </ThemeProvider>
  );

}

export default App;
