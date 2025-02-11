import { Button, CssBaseline, Stack, Step, StepContent, StepLabel, Stepper, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import ConfSvgComponent from './components/ConfSvgComponent';
import HRulSvgComponent from './components/HRulSvgComponent';
import PickSvgComponent from './components/PickSvgComponent';
import RootSvgComponent from './components/RootSvgComponent';
import TimeSvgComponent from './components/TimeSvgComponent';
import VRulSvgComponent from './components/VRulSvgComponent';
import { GeometryUtil } from './util/GeometryUtil';
import { IConfSvgProperties, IConnBleProperties, IFileSvgProperties, ILine3D, ILinePath, IPickSvgProperties, IRootSvgProperties, IStepDefProperties, ITimeSvgProperties } from './util/Interfaces';
import { ObjectUtil } from './util/ObjectUtil';
import { ThemeUtil } from './util/ThemeUtil';
import PickDeviceComponent from './components/PickDeviceComponent';
import BluetoothSenderComponent from './components/BluetoothSenderComponent';

const STEP_DEF_PROPERTIES: IStepDefProperties[] = [
  {
    label: 'pick',
    valid: () => { // fileSvgProperties: IFileSvgProperties, confSvgProperties: IConfSvgProperties
      return true;
    }
  },
  {
    label: 'conf',
    valid: (fileSvgProperties: IFileSvgProperties) => {
      return fileSvgProperties.fileLabel !== '';
    }
  },
  {
    label: 'conn',
    valid: (fileSvgProperties: IFileSvgProperties, confSvgProperties: IConfSvgProperties) => {
      return fileSvgProperties.fileLabel !== '' && confSvgProperties.done;
    }
  },
  {
    label: 'plot',
    valid: (fileSvgProperties: IFileSvgProperties, confSvgProperties: IConfSvgProperties, connBleProperties: IConnBleProperties) => {
      return fileSvgProperties.fileLabel !== '' && confSvgProperties.done && connBleProperties.success;
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

    connBlePropertiesRef.current = {
      ..._connBleProperties,
      ...connBlePropertiesRef.current,
      success: !!_connBleProperties.device
    };
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

  const handleConfSvgPropertiesDone = (done: boolean) => {

    console.debug(`📞 handling conf svg properties (done)`, done);

    confSvgPropertiesRef.current = {
      ...confSvgPropertiesRef.current,
      done
    };
    determineActiveStep();
    // does NOT update svg properties to prevent a full re-render of the svg

  }

  const handleConfSvgProperties = (_confSvgProperties: Pick<IConfSvgProperties, 'paperExtent' | 'connectSort'>) => {

    console.debug(`📞 handling conf svg properties (pathProperties)`, confSvgProperties);

    confSvgPropertiesRef.current = {
      ...confSvgPropertiesRef.current,
      ..._confSvgProperties,
      done: false,
    };
    setConfSvgProperties(confSvgPropertiesRef.current);

  }

  const determineActiveStep = () => {

    // find out which step is possible
    let maxActiveStep = 1;
    for (let i = 0; i < STEP_DEF_PROPERTIES.length; i++) {
      if (STEP_DEF_PROPERTIES[i].valid(fileSvgPropertiesRef.current, confSvgPropertiesRef.current, connBlePropertiesRef.current)) {
        maxActiveStep = i;
      } else {
        break;
      }
    }
    setActiveStep(maxActiveStep);

  }

  const [activeStep, setActiveStep] = useState<number>(0);
  const linesRef = useRef<ILine3D[]>([]);

  const fileSvgPropertiesRef = useRef<IFileSvgProperties>({
    fileLabel: '',
    linePaths: [],
    cubcPaths: []
  });
  const [fileSvgProperties, setFileSvgProperties] = useState<IFileSvgProperties>(fileSvgPropertiesRef.current);

  const confSvgPropertiesRef = useRef<IConfSvgProperties>({
    paperExtent: {
      xMin: 0,
      yMin: 0,
      xMax: 200, // 200
      yMax: 148  // 148
    },
    connectSort: true,
    done: false,
    handleConfSvgProperties
  });
  const [confSvgProperties, setConfSvgProperties] = useState<IConfSvgProperties>(confSvgPropertiesRef.current);

  const rootSvgPropertiesRef = useRef<IRootSvgProperties>({
    lines: [],
    extent: {
      xMin: 0,
      yMin: 0,
      xMax: 210, // A5
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

  useEffect(() => {

    console.debug('⚙ updating root app component (fileSvgProperties, confSvgProperties)', fileSvgProperties, confSvgProperties);

    if (fileSvgProperties.fileLabel !== '' && (fileSvgProperties.linePaths.length > 0 || fileSvgProperties.cubcPaths.length > 0)) {

      // convert cubic curves to lines
      const cubcpathsAsLinepaths = fileSvgProperties.cubcPaths.map(c => GeometryUtil.cubicgroupToLinegroup(c));
      const linepathsMerged = [
        ...fileSvgProperties.linePaths,
        ...cubcpathsAsLinepaths
      ];

      // get extent of all paths (may have negative origin) and translate to origin
      let overallExtent = GeometryUtil.getLinepathsExtent(linepathsMerged);
      const linepathsOrigin = GeometryUtil.translateLinepaths({
        x: -overallExtent.xMin,
        y: -overallExtent.yMin
      }, linepathsMerged);
      overallExtent = GeometryUtil.getLinepathsExtent(linepathsOrigin);

      // scale to fit paper size
      const imageDimX = overallExtent.xMax - overallExtent.xMin;
      const paperDimX = confSvgProperties.paperExtent.xMax - confSvgProperties.paperExtent.xMin;
      const scale = paperDimX / imageDimX;
      const linepathScaleds = GeometryUtil.scaleLinepaths(scale, linepathsOrigin);
      overallExtent = GeometryUtil.getLinepathsExtent(linepathScaleds);

      // simplify and connect
      const linepathSimples = linepathScaleds.map(linepath => GeometryUtil.simplifyLinepath(0.1, linepath));

      // remove short segments
      const linepathNoShorts: ILinePath[] = [];
      for (let i = 0; i < linepathSimples.length; i++) {
        const linepath = GeometryUtil.removeShortSegments(GeometryUtil.PEN_____WIDTH, linepathSimples[i]);
        if (linepath.segments.length > 0) {
          linepathNoShorts.push(linepath);
        }
      };
      linepathNoShorts.forEach(p => {
        for (let i = 0; i < p.segments.length; i++) {
          const s = p.segments[i];
          // p.segments.forEach(s => {
          const lengthAB = GeometryUtil.getDistance2D(s.coordA, s.coordB);
          if (lengthAB < GeometryUtil.PEN_____WIDTH) {
            // console.log('short segment found', lengthAB, 'at position', i, 'in a path containing', p.segments.length, 'segments');
          }
        };
      })

      const linepathConnecteds = GeometryUtil.connectLinepaths({
        x: overallExtent.xMin,
        y: overallExtent.yMin
      }, linepathNoShorts, confSvgProperties.connectSort);

      rootSvgPropertiesRef.current = {
        lines: linepathConnecteds,
        extent: overallExtent,
        selId: ObjectUtil.createId(),
        handleLineClick
      }
      setRootSvgProperties(rootSvgPropertiesRef.current);

      // now lets build a list of 3D lines (aka pen plotter lines)
      const plottableLines = GeometryUtil.linepathsToPlotpaths(linepathConnecteds);
      linesRef.current = plottableLines;

      timeSvgPropertiesRef.current = {
        ...timeSvgPropertiesRef.current,
        lines: linesRef.current
      }
      setTimeSvgProperties(timeSvgPropertiesRef.current);

      connBlePropertiesRef.current = {
        ...connBlePropertiesRef.current,
        handleConnBleProperties
      }
      setConnBleProperties(connBlePropertiesRef.current);

    }

    determineActiveStep();

  }, [fileSvgProperties, confSvgProperties]);

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
            <Step key={'pick'}
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
            <Step key={'conf'}>
              <StepLabel>
                configure
              </StepLabel>
              <StepContent>
                <ConfSvgComponent {...confSvgProperties} />
                <Stack
                  sx={{
                    flexDirection: 'row',
                    padding: '0px',
                    width: 'inherit',
                    paddingTop: '12px'
                  }}

                >
                  <Button
                    variant={'contained'}
                    onClick={() => handleFileSvgProperties({
                      fileLabel: '',
                      linePaths: [],
                      cubcPaths: []
                    })}
                    sx={{
                      flexGrow: 1,
                      marginRight: '3px'
                    }}
                  >
                    back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleConfSvgPropertiesDone(true)}
                    sx={{
                      flexGrow: 1,
                      marginLeft: '3px'
                    }}
                  >
                    next
                  </Button>
                </Stack>
              </StepContent>
            </Step>
            <Step key={'conn'}>
              <StepLabel>
                <Typography>
                  {
                    connBleProperties.device ? `device: ${connBleProperties.device.name}` : 'device'
                  }
                </Typography>
              </StepLabel>
              <StepContent>
                <PickDeviceComponent {...connBleProperties} />
                <Stack
                  sx={{
                    flexDirection: 'row',
                    padding: '0px',
                    width: 'inherit',
                    paddingTop: '12px'
                  }}
                >
                  <Button
                    variant={'contained'}
                    onClick={() => handleConfSvgPropertiesDone(false)}
                    sx={{
                      flexGrow: 1
                    }}
                  >
                    back
                  </Button>
                </Stack>
              </StepContent>
            </Step>
            <Step key={'plot'}>
              <StepLabel>
                plot
              </StepLabel>
              <StepContent>
                <BluetoothSenderComponent {...connBleProperties} lines={linesRef.current} />
                <Stack
                  sx={{
                    flexDirection: 'row',
                    padding: '0px',
                    width: 'inherit',
                    paddingTop: '12px'
                  }}
                >
                  <Button
                    variant={'contained'}
                    onClick={() => {
                      connBleProperties.device?.gatt?.disconnect();
                      handleConnBleProperties({
                        message: 'manual disconnect'
                      });
                    }}
                    sx={{
                      flexGrow: 1
                    }}
                  >
                    disconnect
                  </Button>
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

    </ThemeProvider>

  )
}

export default RootApp
