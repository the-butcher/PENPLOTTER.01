import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Button } from "@mui/material";
import { createRef, useEffect } from "react";

import { IPickSvgProperties } from '../util/Interfaces';
import { SvgUtil } from '../util/SvgUtil';


function PickSvgComponent(props: IPickSvgProperties) {

    const { handleFileSvgProperties } = { ...props };

    useEffect(() => {
        console.debug('✨ building PickSvgComponent');
    }, []);

    const svgContainerRef = createRef<HTMLDivElement>();

    const handleFileUpload = (fileList: FileList) => {
        if (fileList.length > 0) {
            const file = fileList.item(0);
            file!.text().then(text => {
                svgContainerRef.current!.innerHTML = text;
                const svgNode = svgContainerRef.current!.getElementsByTagName('svg').item(0)!;
                SvgUtil.parseSvgPaths(svgNode).then(pathProps => {
                    handleFileSvgProperties({
                        fileLabel: file!.name,
                        ...pathProps
                    });
                });
            });
        }
    }

    return (
        <>
            <Button
                sx={{
                    width: 'inherit'
                }}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<UploadFileIcon />}
            >
                pick svg file
                <input
                    type="file"
                    onChange={(event) => handleFileUpload(event.target.files!)}
                    accept={'.svg'}
                    style={{
                        clip: 'rect(0 0 0 0)',
                        clipPath: 'inset(50%)',
                        height: 1,
                        overflow: 'hidden',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        whiteSpace: 'nowrap',
                        width: 1,
                    }}
                />
            </Button>
            <div
                style={{
                    position: 'absolute',
                    left: '-4000px',
                    top: '-4000px'
                }}
                ref={svgContainerRef}
            />
        </>
    )
}

export default PickSvgComponent
