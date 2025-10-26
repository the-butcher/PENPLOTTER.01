import { Button, CssBaseline, Divider, Stack, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import BluetoothSenderComponent from './components/BluetoothSenderComponent';
import CnfASvgComponent from './components/CnfASvgComponent';
import HRulSvgComponent from './components/HRulSvgComponent';
import PickDeviceComponent from './components/PickDeviceComponent';
import PickSvgComponent from './components/PickSvgComponent';
import RootSvgComponent from './components/RootSvgComponent';
import TimeSvgComponent from './components/TimeSvgComponent';
import VRulSvgComponent from './components/VRulSvgComponent';
import { GeometryUtil } from './util/GeometryUtil';
import { ICnfASvgProperties, ICnfBSvgProperties, IConnBleProperties, IConnectSettings, IFileSvgProperties, ILinePath, IPickSvgProperties, IRootSvgProperties, ISendBleProperties, IStepDefProperties, ITimeSvgProperties } from './util/Interfaces';
import { ObjectUtil } from './util/ObjectUtil';
import { ThemeUtil } from './util/ThemeUtil';
import CnfBSvgComponent from './components/CnfBSvgComponent';
import BluetoothDisabledIcon from '@mui/icons-material/BluetoothDisabled';

const STEP_DEF_PROPERTIES: IStepDefProperties[] = [
  {
    label: 'pick',
    valid: () => {
      return true;
    }
  },
  {
    label: 'cnfa',
    valid: (fileSvgProperties: IFileSvgProperties) => {
      return fileSvgProperties.fileLabel !== '';
    }
  },
  {
    label: 'conn',
    valid: () => {
      return false;
    }
  },
  {
    label: 'cnfb',
    valid: (fileSvgProperties: IFileSvgProperties, _confSvgProperties: ICnfASvgProperties, connBleProperties: IConnBleProperties) => {
      return fileSvgProperties.fileLabel !== '' && connBleProperties.success;
    }
  }
];

function RootApp() {

  const theme = ThemeUtil.createTheme();

  const [screenLock, setScreenLock] = useState<WakeLockSentinel>();

  const isScreenLockSupported = () => {
    return ('wakeLock' in navigator);
  }

  const tryAcquireScreenLock = () => {
    if (isScreenLockSupported()) {
      navigator.wakeLock.request('screen').then(_screenLock => {
        // console.log("lock acquired");
        setScreenLock(_screenLock);
        _screenLock.onrelease = () => {
          // console.log("lock released");
          setScreenLock(undefined);
        };
      });
    } else {
      console.warn('failed to retrieve screen lock due to missing support');
    }
  }

  useEffect(() => {

    console.debug('✨ building RootApp');

    document.addEventListener('visibilitychange', async () => {
      if (!screenLock && document.visibilityState === 'visible') {
        tryAcquireScreenLock();
      }
    });
    tryAcquireScreenLock(); // initial lock

  }, []);

  const handleLineClick = (id: string) => {

    console.debug(`📞 handling line click (id)`, id);

    const end = id.indexOf('_');
    const selId = id.substring(0, end != -1 ? end : undefined);

    const timelines = timeSvgPropertiesRef.current.lines.filter(l => l.id.startsWith(selId));
    console.log('matches: ', timelines);

    rootSvgPropertiesRef.current = {
      ...rootSvgPropertiesRef.current,
      selId
    }
    setRootSvgProperties(rootSvgPropertiesRef.current);
    timeSvgPropertiesRef.current = {
      ...timeSvgPropertiesRef.current,
      selId
    }
    setTimeSvgProperties(timeSvgPropertiesRef.current);

  }

  /**
   * handles either a connect or a disconnect
   * @param connBleProperties
   */
  const handleConnBleProperties = (_connBleProperties: Pick<IConnBleProperties, 'device' | 'message'>) => {

    console.debug(`📞 handling conn ble properties (state)`, _connBleProperties);

    const success = !!_connBleProperties.device;
    connBlePropertiesRef.current = {
      ...connBlePropertiesRef.current,
      ..._connBleProperties,
      device: _connBleProperties.device,
      success
    };
    console.log('connBlePropertiesRef.current', connBlePropertiesRef.current);
    setConnBleProperties(connBlePropertiesRef.current);

  }

  /**
   * handle svg-contents
   * TODO :: store raw svg data here so it can be re-processed once some UI (simplification tolerance, size) has been added
   * @param fileSvgProperties
   */
  const handleFileSvgProperties = (fileSvgProperties: IFileSvgProperties) => {

    console.debug(`📞 handling file svg properties (pathProperties)`, fileSvgProperties);

    fileSvgPropertiesRef.current = {
      ...fileSvgProperties
    }
    setFileSvgProperties(fileSvgPropertiesRef.current);

  }

  const handlePenDone = () => {

    console.log(`📞 handling pen done`);

    sendBlePropertiesRef.current = {
      ...sendBlePropertiesRef.current,
      lines: []
    };
    setSendBleProperties(sendBlePropertiesRef.current);

    cnfBSvgPropertiesRef.current = {
      ...cnfBSvgPropertiesRef.current,
      // penId: ObjectUtil.createId()
    };
    setCnfBSvgProperties(cnfBSvgPropertiesRef.current);

    determineActiveStep();

  }

  const handleCnfASvgProperties = (_cnfASvgProperties: Pick<ICnfASvgProperties, 'paperExtent' | 'connectSort' | 'keepTopLeft'>) => {

    console.log(`📞 handling cnfa a properties (_cnfASvgProperties)`, _cnfASvgProperties);

    cnfASvgPropertiesRef.current = {
      ...cnfASvgPropertiesRef.current,
      ..._cnfASvgProperties
    };
    setCnfASvgProperties(cnfASvgPropertiesRef.current);

  }

  const handleCnfBSvgProperties = (_cnfBSvgProperties: Pick<ICnfBSvgProperties, 'penMaxSpeed' | 'penId'>) => {

    console.log(`📞 handling cnfn b properties (_cnfBSvgProperties)`, _cnfBSvgProperties);

    cnfBSvgPropertiesRef.current = {
      ...cnfBSvgPropertiesRef.current,
      ..._cnfBSvgProperties
    };
    setCnfBSvgProperties(cnfBSvgPropertiesRef.current);

  }

  const determineActiveStep = () => {

    // find out which step is possible
    let maxActiveStep = 1;
    for (let i = 0; i < STEP_DEF_PROPERTIES.length; i++) {
      if (STEP_DEF_PROPERTIES[i].valid(fileSvgPropertiesRef.current, cnfASvgPropertiesRef.current, connBlePropertiesRef.current, cnfBSvgPropertiesRef.current, sendBlePropertiesRef.current)) {
        maxActiveStep = i;
      }
    }
    setActiveStep(maxActiveStep);

  }

  const [activeStep, setActiveStep] = useState<number>(0);
  // const linesRef = useRef<ILine3D[]>([]);

  const fileSvgPropertiesRef = useRef<IFileSvgProperties>({
    fileLabel: '',
    linePaths: [],
    cubcPaths: [],
    extent: {
      xMin: 0,
      yMin: 0,
      xMax: 0,
      yMax: 0
    }
  });
  const [fileSvgProperties, setFileSvgProperties] = useState<IFileSvgProperties>(fileSvgPropertiesRef.current);

  const cnfASvgPropertiesRef = useRef<ICnfASvgProperties>({
    paperExtent: {
      xMin: 0,
      yMin: 0,
      xMax: 290, // 176 (a4 hoch), 200
      yMax: 148  // 148
    },
    connectSort: true,
    keepTopLeft: false,
    handleCnfASvgProperties
  });
  const [cnfASvgProperties, setCnfASvgProperties] = useState<ICnfASvgProperties>(cnfASvgPropertiesRef.current);

  const cnfBSvgPropertiesRef = useRef<ICnfBSvgProperties>({
    penMaxSpeed: 20,
    penIds: [],
    penId: ObjectUtil.createId(),
    handleCnfBSvgProperties
  });
  const [cnfBSvgProperties, setCnfBSvgProperties] = useState<ICnfBSvgProperties>(cnfBSvgPropertiesRef.current);

  const rootSvgPropertiesRef = useRef<IRootSvgProperties>({
    lines: [],
    extent: {
      xMin: 0,
      yMin: 0,
      xMax: 290, // 176 (a4 hoch), 200
      yMax: 148  // A5
    },
    selId: ObjectUtil.createId(),
    handleLineClick
  });
  const [rootSvgProperties, setRootSvgProperties] = useState<IRootSvgProperties>(rootSvgPropertiesRef.current);

  const [pickSvgProperties] = useState<IPickSvgProperties>({
    handleFileSvgProperties
  });

  const timeSvgPropertiesRef = useRef<ITimeSvgProperties>({
    lines: [],
    selId: ObjectUtil.createId(),
    handleLineClick
  });
  const [timeSvgProperties, setTimeSvgProperties] = useState<ITimeSvgProperties>(timeSvgPropertiesRef.current);

  const connBlePropertiesRef = useRef<IConnBleProperties>({
    success: false,
    message: '',
    handleConnBleProperties
  });
  const [connBleProperties, setConnBleProperties] = useState<IConnBleProperties>(connBlePropertiesRef.current);

  const sendBlePropertiesRef = useRef<ISendBleProperties>({
    lines: [],
    handlePenDone,
    penId: ObjectUtil.createId()
  });
  const [sendBleProperties, setSendBleProperties] = useState<ISendBleProperties>(sendBlePropertiesRef.current);

  useEffect(() => {

    console.log('⚙ updating root app component (fileSvgProperties)', fileSvgProperties);

    if (fileSvgProperties.fileLabel !== '' && (fileSvgProperties.linePaths.length > 0 || fileSvgProperties.cubcPaths.length > 0)) {

      const penIds: string[] = [];
      fileSvgProperties.linePaths.forEach(linepath => {
        if (penIds.indexOf(linepath.penId) === -1) {
          penIds.push(linepath.penId);
        }
      });
      fileSvgProperties.cubcPaths.forEach(cubcPath => {
        if (penIds.indexOf(cubcPath.penId) === -1) {
          penIds.push(cubcPath.penId);
        }
      });
      penIds.sort();

      console.log('penIds from file', penIds);
      let penId = ObjectUtil.createId();
      // if (penIds.indexOf('c050') !== -1) {
      //   penId = 'c050';
      // }

      cnfBSvgPropertiesRef.current = {
        ...cnfBSvgPropertiesRef.current,
        penIds,
        penId
      };
      setCnfBSvgProperties(cnfBSvgPropertiesRef.current);

    }

  }, [fileSvgProperties]);

  const lastConnectSettings = useRef<IConnectSettings>({
    linePathCount: 0,
    cubcPathCount: 0,
    paperDimX: 0,
    penId: ObjectUtil.createId()
  });

  useEffect(() => {

    console.debug('⚙ updating root app component (cnfASvgProperties, cnfBSvgProperties)', cnfASvgProperties, cnfBSvgProperties);

    if (fileSvgProperties.fileLabel !== '' && (fileSvgProperties.linePaths.length > 0 || fileSvgProperties.cubcPaths.length > 0)) {

      let connectRequired = false;
      if (fileSvgProperties.linePaths.length !== lastConnectSettings.current.linePathCount || fileSvgProperties.cubcPaths.length !== lastConnectSettings.current.cubcPathCount) {
        connectRequired = true;
        console.log('connectRequired due to changed linecounts');
      }
      lastConnectSettings.current.linePathCount = fileSvgProperties.linePaths.length;
      lastConnectSettings.current.cubcPathCount = fileSvgProperties.cubcPaths.length;

      // convert cubic curves to lines
      const cubcpathsAsLinepaths = fileSvgProperties.cubcPaths.map(c => GeometryUtil.cubicgroupToLinegroup(c));
      const linepathsMerged = [
        ...fileSvgProperties.linePaths,
        ...cubcpathsAsLinepaths
      ];

      // get extent of all paths (may have negative origin) and translate to origin
      let overallExtent = GeometryUtil.getLinepathsExtent(linepathsMerged);
      const linepathsOrigin: ILinePath[] = [];
      if (cnfASvgProperties.keepTopLeft) {
        linepathsOrigin.push(...linepathsMerged);
      } else {
        linepathsOrigin.push(...GeometryUtil.translateLinepaths({
          x: -overallExtent.xMin,
          y: -overallExtent.yMin
        }, linepathsMerged))
      }
      overallExtent = GeometryUtil.getLinepathsExtent(linepathsOrigin);
      if (cnfASvgProperties.keepTopLeft) {
        overallExtent.xMin = 0;
        overallExtent.yMin = 0;
        overallExtent.xMax = fileSvgProperties.extent.xMax - fileSvgProperties.extent.xMin;
        overallExtent.yMax = fileSvgProperties.extent.yMax - fileSvgProperties.extent.yMin;
      }

      // scale to fit paper size
      const imageDimX = overallExtent.xMax - overallExtent.xMin;
      const paperDimX = cnfASvgProperties.paperExtent.xMax - cnfASvgProperties.paperExtent.xMin;
      const scale = paperDimX / imageDimX;
      const linepathScaleds = GeometryUtil.scaleLinepaths(scale, linepathsOrigin);
      // console.log('linepathScaleds', linepathScaleds.length);

      overallExtent = GeometryUtil.getLinepathsExtent(linepathScaleds);
      if (cnfASvgProperties.keepTopLeft) {
        overallExtent.xMin = 0;
        overallExtent.yMin = 0;
        overallExtent.xMax = (fileSvgProperties.extent.xMax - fileSvgProperties.extent.xMin) * scale;
        overallExtent.yMax = (fileSvgProperties.extent.yMax - fileSvgProperties.extent.yMin) * scale;
      }

      if (paperDimX !== lastConnectSettings.current.paperDimX) {
        connectRequired = true;
        console.log('connectRequired due to changed paperDimX');
      }
      lastConnectSettings.current.paperDimX = paperDimX;

      // TODO :: REMOVE (start at position)
      // cnfBSvgProperties.penId = 'c050';

      const isPenIdSet = ObjectUtil.isPenIdSet(cnfBSvgProperties.penId);
      // console.log('isPenIdSet', isPenIdSet, cnfBSvgProperties.penId.length, cnfBSvgProperties.penId);

      if (cnfBSvgProperties.penId !== lastConnectSettings.current.penId) {
        connectRequired = true;
        console.log('connectRequired due to changed penId');
      }
      lastConnectSettings.current.penId = cnfBSvgProperties.penId;

      // filtering for penId
      const linepathPenIds = isPenIdSet ? linepathScaleds.filter(p => p.penId === cnfBSvgProperties.penId) : linepathScaleds;
      // console.log('linepathPenIds', linepathPenIds.length);

      // simplify and connect
      const linepathSimples = linepathPenIds.map(linepath => GeometryUtil.simplifyLinepath(0.010, linepath));
      // console.log('linepathSimples', linepathSimples.length);

      // remove short segments
      const linepathNoShorts: ILinePath[] = [];
      for (let i = 0; i < linepathSimples.length; i++) {
        const linepath = GeometryUtil.removeShortSegments(GeometryUtil.PEN_WIDTH_SEG, linepathSimples[i]);
        if (linepath.segments.length > 0) {
          linepathNoShorts.push(linepath);
        }
      };
      linepathNoShorts.forEach(p => {
        for (let i = 0; i < p.segments.length; i++) {
          const s = p.segments[i];
          // p.segments.forEach(s => {
          const lengthAB = GeometryUtil.getDistance2D(s.coordA, s.coordB);
          if (lengthAB < GeometryUtil.PEN_WIDTH_SEG) {
            // console.log('short segment found', lengthAB, 'at position', i, 'in a path containing', p.segments.length, 'segments');
          }
        };
      })

      let linepathConnecteds: ILinePath[] = [];
      if (connectRequired) {

        console.log('linepathNoShorts', linepathNoShorts.length, cnfBSvgProperties.penId);
        linepathConnecteds = GeometryUtil.connectLinepaths({
          x: overallExtent.xMin,
          y: overallExtent.yMin
        }, linepathNoShorts, cnfASvgProperties.connectSort, !ObjectUtil.isPenIdSet(cnfBSvgProperties.penId) || cnfBSvgProperties.penId === 'h013' || cnfBSvgProperties.penId === 'w013'); // cnfBSvgProperties.penId === 'h013' || !ObjectUtil.isPenIdSet(cnfBSvgProperties.penId)

        console.log('linepathConnecteds', linepathConnecteds.length);
        // TODO :: REMOVE (start at position)
        // const skipCountA = 13;
        // // linepathConnecteds.splice(skipCountA, linepathConnecteds.length - skipCountA);
        // linepathConnecteds.splice(0, skipCountA);
        // if (linepathConnecteds.length > 0) {
        //   // const segments = linepathConnecteds[linepathConnecteds.length - 1].segments;
        //   const segments = linepathConnecteds[0].segments;
        //   console.log('segments', segments.length);
        //   const skipCountB = 525;
        //   console.log('linepathConnecteds[0].segments', linepathConnecteds[0].segments);
        //   segments.splice(0, skipCountB);
        //   // segments.splice(skipCountB, segments.length - skipCountB);
        // }

        rootSvgPropertiesRef.current = {
          lines: linepathConnecteds,
          extent: overallExtent,
          selId: ObjectUtil.createId(),
          handleLineClick
        }
        setRootSvgProperties(rootSvgPropertiesRef.current);

      } else {

        linepathConnecteds = rootSvgPropertiesRef.current.lines;

      }



      // now lets build a list of 3D lines (aka pen plotter lines)
      const plottableLines = GeometryUtil.linepathsToPlotpaths(linepathConnecteds, cnfBSvgProperties.penMaxSpeed);
      // console.log('plottableLines', plottableLines.length);

      // TODO :: REMOVE (start at position)
      // if (plottableLines.length > 0) {
      //   plottableLines[0].coordB.z = GeometryUtil.Z_VALUE_PEN_U;
      // }

      timeSvgPropertiesRef.current = {
        ...timeSvgPropertiesRef.current,
        lines: plottableLines
      };
      setTimeSvgProperties(timeSvgPropertiesRef.current);

      connBlePropertiesRef.current = {
        ...connBlePropertiesRef.current,
        handleConnBleProperties
      };
      setConnBleProperties(connBlePropertiesRef.current);


      if (isPenIdSet) {
        sendBlePropertiesRef.current = {
          ...sendBlePropertiesRef.current,
          lines: plottableLines,
          penId: cnfBSvgProperties.penId
        };
        setSendBleProperties(sendBlePropertiesRef.current);
      }

    }

    determineActiveStep();

  }, [cnfASvgProperties, cnfBSvgProperties]);

  useEffect(() => {

    console.debug('⚙ updating root app component (connBleProperties)', connBleProperties);

    determineActiveStep();

  }, [connBleProperties]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack
        sx={{
          flexDirection: 'row',
          padding: '0px'
        }}
      >
        <div>
          <Stepper activeStep={activeStep} orientation="vertical"
            sx={{
              width: '250px'
            }}
          >
            <Step key={'pick'} active={true}
              sx={{
                width: 'inherit'
              }}
            >
              <StepLabel>
                <Typography>
                  {
                    fileSvgProperties.fileLabel !== '' ? `content: ${fileSvgProperties.fileLabel}` : 'content'
                  }
                </Typography>
              </StepLabel>
              <StepContent>
                {
                  fileSvgProperties.fileLabel === '' ? <PickSvgComponent {...pickSvgProperties} /> : null
                }
              </StepContent>
            </Step>
            <Step key={'cnfa'} active={true}>
              <StepLabel>
                configure
              </StepLabel>
              <StepContent>
                <Stack
                  sx={{
                    flexDirection: 'column',
                    padding: '0px',
                    width: 'inherit',
                    paddingTop: '12px'
                  }}
                >
                  <CnfASvgComponent {...cnfASvgProperties} />
                  <Divider
                    sx={{
                      marginTop: '6px',
                      marginBottom: '24px'
                    }}
                  />
                  <CnfBSvgComponent {...cnfBSvgProperties} />
                  {/* {
                    connBleProperties.device ? <BluetoothSenderComponent {...{
                      ...connBleProperties,
                      ...sendBleProperties
                    }} /> : null
                  } */}
                </Stack>
              </StepContent>
            </Step>
            <Step key={'conn'} active={true}>
              <StepLabel>
                <Stack
                  sx={{
                    flexDirection: 'column',
                    padding: '0px',
                    width: 'inherit',
                    // paddingTop: '12px'
                  }}
                >
                  <Typography>
                    {
                      connBleProperties.device ? `device: ${connBleProperties.device.name}` : 'device'
                    }
                  </Typography>

                </Stack>
              </StepLabel>
              <StepContent>
                <Stack
                  sx={{
                    flexDirection: 'column',
                    padding: '0px',
                    width: 'inherit',
                    // paddingTop: '12px'
                  }}
                >
                  {
                    connBleProperties.device ?
                      <Button
                        startIcon={<BluetoothDisabledIcon />}
                        variant={'contained'}
                        onClick={() => {
                          connBleProperties.device?.gatt?.disconnect();
                          handleConnBleProperties({
                            // device implicitly undefined
                            message: 'manual disconnect'
                          });
                        }}
                        sx={{
                          flexGrow: 1,
                          marginRight: '10px'
                        }}
                      >
                        disconnect
                      </Button>
                      : <PickDeviceComponent {...connBleProperties} />
                  }

                </Stack>

              </StepContent>
            </Step>
            <Step key={'cnfb'}>
              <StepLabel>
                configure
              </StepLabel>
              <StepContent>
                <Stack
                  sx={{
                    flexDirection: 'column',
                    padding: '0px',
                    width: 'inherit',
                    paddingTop: '12px'
                  }}
                >
                  {/* <CnfBSvgComponent {...cnfBSvgProperties} /> */}
                  {
                    connBleProperties.device ? <BluetoothSenderComponent {...{
                      ...connBleProperties,
                      ...sendBleProperties
                    }} /> : null
                  }
                </Stack>
              </StepContent>
            </Step>

          </Stepper>
        </div>
        {
          fileSvgProperties.fileLabel !== '' ? <Stack
            sx={{
              flexDirection: 'row'
            }}
          >
            <VRulSvgComponent  {...rootSvgProperties} />
            <Stack
              sx={{
                flexDirection: 'column'
              }}
            >
              <RootSvgComponent {...rootSvgProperties} />
              <HRulSvgComponent  {...rootSvgProperties} />
              <TimeSvgComponent {...timeSvgProperties} />
            </Stack>
          </Stack> : null
        }


      </Stack>

    </ThemeProvider >

  )
}

export default RootApp
