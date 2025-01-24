import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect, useState } from 'react';
import './App.css';
import AccelerationChartComponent from './components/AccelerationChartComponent';
import BluetoothSenderComponent, { IBluetoothSenderProps } from './components/BluetoothSenderComponent';
import { IBlockPlanar } from './components/IBlockPlanar';
import { ICoordPlanar } from './components/ICoordPlanar';
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

  const [cmdDestProps, setCmdDestProps] = useState<IBluetoothSenderProps[]>([]);
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

    fetch("kusuduma.gcode").then((res) => res.text()).then((text) => {

      const _fileCoords: ICoordPlanar[] = [];

      const lines: string[] = text.split('\n');
      let line: String;
      let xLast = 0;
      let yLast = 0;
      let zLast = CoordUtil.PEN_Z_U;

      for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {

        line = lines[lineIndex];
        if (line.indexOf('X') >= 0 && line.indexOf('Y') >= 0) { // has both X and Y
          // console.log(line);
          const isMove = line.startsWith('G00 F');
          const isDraw = line.startsWith('G01 F');
          if (isMove || isDraw) {

            const xCurr = parseFloat(line.substring(line.indexOf('X') + 1, line.indexOf('Y')).trim());
            const yCurr = parseFloat(line.substring(line.indexOf('Y') + 1, line.indexOf(';')).trim());
            const zCurr = isMove ? CoordUtil.PEN_Z_U : CoordUtil.PEN_Z_D;

            if (zLast !== zCurr) { // up or down, if not in the correct position, add Z-coordinate
              _fileCoords.push({
                x1: xLast,
                y1: yLast,
                z1: zCurr
              });
            }

            // const fileCoord = {
            //   x1: xCurr,
            //   y1: yCurr,
            //   z1: zCurr
            // }

            // // TODO :: if pointing in the same direction than the last coord -> join, append otherwise


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

      // // const _blockCoords2: IBlockPlanar[] = [];
      // for (let index = 1; index < _blockCoords.length - 1; index++) {
      //   if (CoordUtil.sameDir(_blockCoords[index - 1], _blockCoords[index])) {
      //     console.log("found joinable block", index - 1, ' --> ', index);
      //   }
      // }

      // max-junction speed calculation
      for (let index = 0; index < _fileCoords.length - 1; index++) {
        // dotAB = CoordUtil.blockDot(CoordUtil.toUnitCoord(_blockCoords[index]), CoordUtil.toUnitCoord(_blockCoords[index + 1]));
        // dotAB = Math.max(0, dotAB);
        dotAB = Math.acos(CoordUtil.blockDot(CoordUtil.toUnitCoord(_blockCoords[index]), CoordUtil.toUnitCoord(_blockCoords[index + 1])));
        dotAB = 1 - Math.min(CoordUtil.SEMI_PI, dotAB) / CoordUtil.SEMI_PI;
        console.log('dotAB', dotAB, Math.max(CoordUtil.MIN_MMS, dotAB * CoordUtil.MAX_MMS));
        // dotAB = Math.min(1, dotAB + 0.1);
        _blockCoords[index].vo = Math.max(CoordUtil.MIN_MMS, dotAB * CoordUtil.MAX_MMS);
        _blockCoords[index + 1].vi = Math.max(CoordUtil.MIN_MMS, dotAB * CoordUtil.MAX_MMS);
      }

      // setMonoCoords(_blockCoords);

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

      const minVRatio = 1.2; // 1.2

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

            if (CoordUtil.MAX_MMS / _blockCoords[index].vi > minVRatio && CoordUtil.MAX_MMS / _blockCoords[index].vo > minVRatio) {
              if (lViToVm > 0.0) {
                _monoCoords.push(CoordUtil.toMultBlock(_blockCoords[index], 0, lViToVm, _blockCoords[index].vi, CoordUtil.MAX_MMS)); // accelerate
              }
              _monoCoords.push(CoordUtil.toMultBlock(_blockCoords[index], lViToVm, lViToVm + lDiff, CoordUtil.MAX_MMS, CoordUtil.MAX_MMS)); // full speed
              if (lVmToVo > 0.0) {
                _monoCoords.push(CoordUtil.toMultBlock(_blockCoords[index], lViToVm + lDiff, _blockCoords[index].l, CoordUtil.MAX_MMS, _blockCoords[index].vo)); // decelerate
              }
            } else {
              _monoCoords.push(CoordUtil.toMultBlock(_blockCoords[index], 0, _blockCoords[index].l, _blockCoords[index].vi, _blockCoords[index].vo)); // full speed
            }
            _monoCoords[_monoCoords.length - 1].bb = true;

          } else { // can not reach full speed, in and out must be shortened

            // overshoot length both on acceleration and deceleration side
            const lDiff = (lViToVmToVo - _blockCoords[index].l) / 2;
            // console.log('full speed is not reachable'.padEnd(35, ' '), index, 'lDiff', lDiff.toFixed(3).padStart(7, ' '), 'l', blockCoords[index].l.toFixed(3).padStart(7, ' '));

            const vS = Math.sqrt((lViToVm - lDiff) * 2 * acc + _blockCoords[index].vi * _blockCoords[index].vi);

            if (vS / _blockCoords[index].vi > minVRatio && vS / _blockCoords[index].vo > minVRatio) {
              const blockA = CoordUtil.toMultBlock(_blockCoords[index], 0, lViToVm - lDiff, _blockCoords[index].vi, vS);
              if (blockA.l > 0.0) {
                _monoCoords.push(blockA); // accelerate
              }
              const blockB = CoordUtil.toMultBlock(_blockCoords[index], lViToVm - lDiff, _blockCoords[index].l, vS, _blockCoords[index].vo);
              if (blockB.l > 0.0) {
                _monoCoords.push(blockB); // decelerate
              }
            } else {
              _monoCoords.push(CoordUtil.toMultBlock(_blockCoords[index], 0, _blockCoords[index].l, _blockCoords[index].vi, _blockCoords[index].vo)); // full speed

            }
            _monoCoords[_monoCoords.length - 1].bb = true;

          }

        }

        console.log('_monoCoords', _monoCoords);
        setMonoCoords(_monoCoords);

      }

    }).catch((e) => console.error(e));

  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <AccelerationChartComponent {...{
          blocks: monoCoords
        }}></AccelerationChartComponent>
        <PickerComponent {...{ handleDevicePicked }} />
        {
          cmdDestProps.map(device => <BluetoothSenderComponent key={device.device.id} {...device} />)
        }

      </div>
    </ThemeProvider>
  );

}

export default App;
