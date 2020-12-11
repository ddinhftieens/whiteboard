
import React, { useRef, useEffect } from 'react'
import io from 'socket.io-client';
import '../styles/board.css'

function Board() {
    const canvasRef = useRef(null);
    // const colorsRef = useRef(null);
    const socketRef = useRef();

    useEffect(() => {
        let colorPre = 'black';
        let lineWidth = 2;
        // var history = []
        const idUser = new Date().getTime();

        // --------------- getContext() method returns a drawing context on the canvas-----

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let erasering = false;
        let rectangleBool = false;
        let lineBool = false;
        let circleBool = false;

        // ----------------------- Colors --------------------------------------------------

        const colors = document.getElementsByClassName('color');
        // set the current color
        // type = 0 -> draw, type = 1 -> rectagle, type = 2 -> line, type = 3 cricle
        const current = {
            color: 'black',
            lineWidth: 2,
            type: 0
        };

        // helper that will update the current color
        const onColorUpdate = (e) => {
            if (!erasering) current.color = e.target.className.split(' ')[1];
        };

        const setColor = (e) => {
            if (!erasering) current.color = e.target.value;
        }

        document.getElementById('inputColor').addEventListener('change', setColor, false);

        // loop through the color elements and add the click event listeners
        for (let i = 0; i < colors.length; i++) {
            colors[i].addEventListener('click', onColorUpdate, false);
        }
        let drawing = false;

        // ------------------------------- game ox ---------------------------------------

        const initGame = () => {
            if (erasering) return;
            for (let i = 0; i < 20; i++) {
                draw(150, 150 + i * 40, 1000, 150 + i * 40, current.color, current.lineWidth, current.type, true);
                draw(190 + i * 40, 110, 190 + i * 40, 950, current.color, current.lineWidth, current.type, true);
            }
        }
        document.getElementById("gameOX").addEventListener('click', initGame, false);

        // ------------------------------- set linewidth ---------------------------------------

        const initLineWidth = (e) => {
            current.lineWidth = e.target.value;
        }
        document.getElementById("inputLineWidth").addEventListener('change', initLineWidth, false);

        // ------------------------------- eraser ---------------------------------------

        const eraserFunc = (e) => {
            erasering = !erasering;
            if (erasering) {
                colorPre = current.color
                lineWidth = current.lineWidth
                current.color = 'white';
                current.lineWidth = 20;
                document.getElementById("eraserId").style.backgroundColor = 'rgb(243, 199, 116)'
                document.getElementById("whiteboardId").style.cursor = 'not-allowed'
            } else {
                current.color = colorPre
                current.lineWidth = lineWidth
                document.getElementById("eraserId").style.backgroundColor = null
                document.getElementById("whiteboardId").style.cursor = 'default'
            }
        }
        document.getElementById("eraser").addEventListener('click', eraserFunc, false);

        // ------------------------------- rectangle ---------------------------------------

        const rectangleFunc = (e) => {
            rectangleBool = !rectangleBool;
            if (rectangleBool && !erasering && (current.type === 0)) {
                current.type = 1;
                document.getElementById("rectangleId").style.backgroundColor = 'rgb(243, 199, 116)'
            } else {
                rectangleBool = false;
                if (current.type === 1) current.type = 0;
                document.getElementById("rectangleId").style.backgroundColor = null
            }
        }
        document.getElementById("rectangle").addEventListener('click', rectangleFunc, false);

        // ------------------------------- line ---------------------------------------

        const lineFunc = (e) => {
            lineBool = !lineBool;
            if (lineBool && !erasering && (current.type === 0)) {
                current.type = 2;
                document.getElementById("lineId").style.backgroundColor = 'rgb(243, 199, 116)'
            } else {
                if (current.type === 2) current.type = 0;
                lineBool = false;
                document.getElementById("lineId").style.backgroundColor = null
            }
        }
        document.getElementById("line").addEventListener('click', lineFunc, false);

        // ------------------------------- circle ---------------------------------------

        const circleFunc = (e) => {
            circleBool = !circleBool;
            if (circleBool && !erasering && (current.type === 0)) {
                current.type = 3;
                document.getElementById("circleId").style.backgroundColor = 'rgb(243, 199, 116)'
            } else {
                if (current.type === 3) current.type = 0;
                circleBool = false;
                document.getElementById("circleId").style.backgroundColor = null
            }
        }
        document.getElementById("circle").addEventListener('click', circleFunc, false);

        // ------------------------------- undo ---------------------------------------
        const undoFunc = (e) => {
            if (!erasering) {
                socketRef.current.emit('undoCavas', 'undo');
                // if(history.length > 1){
                //     history.pop();
                //     socketRef.current.emit('undoCavas', history[history.length - 1]);
                // }
            }
        }
        document.getElementById("undo").addEventListener('click', undoFunc, false);

        // ------------------------------- clearFile ---------------------------------------selectLineWidth
        const clearFunc = (e) => {
            socketRef.current.emit('clearCanvas', null);
        }
        document.getElementById("clearFile").addEventListener('click', clearFunc, false);

        let lineWidthSelected = false;
        // ------------------------------- selectLineWidth ---------------------------------------
        const inputLineWidthFunc = (e) => {
            lineWidthSelected = !lineWidthSelected;
            if (lineWidthSelected) document.getElementById("inputLineWidth").style.display = 'block';
            else document.getElementById("inputLineWidth").style.display = 'none';
        }
        document.getElementById("selectLineWidth").addEventListener('click', inputLineWidthFunc, false);

        // ------------------------------- export canvas ---------------------------------------
        let exportCanvasChk = false;
        const exportCanvasFunc = (e) => {
            exportCanvasChk = !exportCanvasChk;
            // var lnk = document.createElement('a');
            // lnk.download = "tiennd.png";
            // lnk.href = canvas.toDataURL("image/png;base64");
            // lnk.click();
            if (exportCanvasChk) document.getElementById("fileNameId").style.display = 'block';
            else document.getElementById("fileNameId").style.display = 'none';
        }
        document.getElementById("exportCanvasToImage").addEventListener('click', exportCanvasFunc, false);

        let fileName = "";
        // ------------------------------ input fileName -----------------------------
        const fileNameFunc = (e) => {
            fileName = e.target.value;
            var lnk = document.createElement('a');
            lnk.download = fileName + ".png";
            lnk.href = canvas.toDataURL("image/png;base64");
            lnk.click();
        }
        document.getElementById("fileNameId").addEventListener('change', fileNameFunc, false);


        // ------------------------------- import Image -------------------------------
        const uploadImageFunc = (e) => {
            document.getElementById("inputImage").click();
        }

        document.getElementById("uploadImage").addEventListener('click', uploadImageFunc, false);

        const selectImageFunc = (e) => {
            if (e.target.files.length === 0) return;
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = function (event) {
                var img = new Image();
                img.onload = function () {
                    context.drawImage(img, current.x, current.y);
                    socketRef.current.emit('clearCanvas', canvas.toDataURL());
                }
                img.src = event.target.result;
            }
        }
        document.getElementById("inputImage").addEventListener('change', selectImageFunc, false);
        // ------------------------------- create the draw ----------------------------

        const draw = (x0, y0, x1, y1, color, lineWidth, type, emit) => {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.stroke();
            context.closePath();

            if (!emit) {
                // history.push(canvas.toDataURL());
                // if(!drawing) history.pop();
                return;
            }
            const w = canvas.width;
            const h = canvas.height;

            socketRef.current.emit('drawing', {
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color,
                lineWidth,
                type
            });
        };

        // ------------------------------- create the fillRect ----------------------------
        const drawRect = (x0, y0, width, height, color, lineWidth, type, emit) => {
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.rect(x0, y0, width, height);
            context.stroke();
            context.closePath();

            if (!emit) {
                // history.push(canvas.toDataURL());
                // if(!drawing) history.pop();
                return;
            }
            const w = canvas.width;
            const h = canvas.height;

            socketRef.current.emit('drawing', {
                x0: x0 / w,
                y0: y0 / h,
                x1: width / w,
                y1: height / h,
                color,
                lineWidth,
                type
            });
        };

        // ------------------------------- create the drawLine ----------------------------
        const drawLine = (x0, y0, x1, y1, color, lineWidth, type, emit) => {
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.stroke();
            context.closePath();

            if (!emit) {
                // history.push(canvas.toDataURL());
                // if(!drawing) history.pop();
                return;
            }
            const w = canvas.width;
            const h = canvas.height;

            socketRef.current.emit('drawing', {
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color,
                lineWidth,
                type
            });
        };

        // ------------------------------- create the fillCircle ----------------------------

        const drawCircle = (x0, y0, width, height, color, lineWidth, type, emit) => {
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.arc(x0, y0, width, 0, 2 * Math.PI);
            context.stroke();
            context.closePath();

            if (!emit) {
                // history.push(canvas.toDataURL());
                // if(!drawing) history.pop();
                return;
            }
            const w = canvas.width;
            const h = canvas.height;

            socketRef.current.emit('drawing', {
                x0: x0 / w,
                y0: y0 / h,
                x1: width / w,
                y1: height / h,
                color,
                lineWidth,
                type
            });
        };

        // ---------------- mouse movement --------------------------------------

        const onMouseDown = (e) => {
            if (e.clientX === 0 || e.clientY === 0) return;
            drawing = true;
            // history.push(canvas.toDataURL());
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
        };

        const onMouseMove = (e) => {
            if (!drawing) { return; }
            if (e.clientX === 0 || e.clientY === 0) return;
            switch (current.type) {
                case 0: {
                    draw(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.lineWidth, current.type, true);
                    current.x = e.clientX || e.touches[0].clientX;
                    current.y = e.clientY || e.touches[0].clientY;
                    break
                }
                default: {
                    break
                }
            }
        };

        const onMouseUp = (e) => {
            if (!drawing) { return; }
            if (e.clientX === 0 || e.clientY === 0) return;
            if ((e.type === "touchcancel" || e.type === "touchend") && e.touches[0] === undefined) {
                return;
            }
            drawing = false;
            // history.push(canvas.toDataURL());
            // draw(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.lineWidth, true);
            switch (current.type) {
                case 0: {
                    draw(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.lineWidth, current.type, true);
                    break
                }
                case 1: {
                    drawRect(current.x, current.y, Math.abs((e.clientX || e.touches[0].clientX) - current.x), Math.abs((e.clientY || e.touches[0].clientY) - current.y), current.color, current.lineWidth, current.type, true);
                    break
                }
                case 2: {
                    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.lineWidth, current.type, true);
                    break
                }
                case 3: {
                    drawCircle(current.x, current.y, Math.abs((e.clientX || e.touches[0].clientX) - current.x), e.clientY || e.touches[0].clientY, current.color, current.lineWidth, current.type, true);
                    break
                }
                default: {
                    break
                }
            }
            socketRef.current.emit('updateCanvas', canvas.toDataURL());
        };

        // ----------- limit the number of events per second -----------------------

        const throttle = (callback, delay) => {
            let previousCall = new Date().getTime();
            return function () {
                const time = new Date().getTime();

                if ((time - previousCall) >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
            };
        };

        // -----------------add event listeners to our canvas ----------------------

        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('mouseout', onMouseUp, false);
        canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

        // Touch support for mobile devices
        canvas.addEventListener('touchstart', onMouseDown, false);
        canvas.addEventListener('touchend', onMouseUp, false);
        canvas.addEventListener('touchcancel', onMouseUp, false);
        canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

        // -------------- make the canvas fill its parent component -----------------

        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // window.addEventListener('resize', onResize, false);
        onResize();

        // ----------------------- socket.io connection ----------------------------
        const onDrawingEvent = (data) => {
            const w = canvas.width;
            const h = canvas.height;
            switch (data.type) {
                case 0: {
                    draw(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineWidth, data.type);
                    break;
                }
                case 1: {
                    drawRect(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineWidth, data.type);
                    break;
                }
                case 2: {
                    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineWidth, data.type);
                    break;
                }
                case 3: {
                    drawCircle(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineWidth, data.type);
                    break;
                }
                default: {
                    break
                }
            }
        }
        socketRef.current = io.connect('http://192.168.0.38:9700');
        socketRef.current.emit('newConnect', idUser);
        socketRef.current.on('drawing', onDrawingEvent);

        const onDrawingCanvasPre = (data) => {
            var img = new Image();
            img.src = data;
            // history.push(data);
            img.onload = function () {
                context.drawImage(img, 0, 0)
            }
        }

        socketRef.current.on('newConnected', onDrawingCanvasPre);

        const undoDrawingFunc = (data) => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            var img = new Image();
            img.src = data;

            img.onload = function () {
                context.drawImage(img, 0, 0)
            }
        }

        socketRef.current.on('undoDrawing', undoDrawingFunc);

        const clearCanvasFunc = (data) => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            var img = new Image();
            img.src = data;
            img.onload = function () {
                context.drawImage(img, 0, 0)
            }
        }

        socketRef.current.on('clearCanvas', clearCanvasFunc);

    }, []);
    return (
        <div>
            <canvas ref={canvasRef} className="whiteboard" id="whiteboardId" />

            <div className="colors">
                {/* <div className="d-flex flex-wrap" ref={colorsRef}>
                    <div className="color black" />
                    <div className="color red" />
                    <div className="color green" />
                    <div className="color blue" />
                </div> */}
                <div className="inputColorPicker">
                    <input type="color" id="inputColor" />
                </div>
                <div className="inputColorPicker">
                    <div className="d-flex align-items-center">
                        {/* <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-pencil-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                        </svg> */}
                        <svg id="selectLineWidth" width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-pencil-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                        </svg>
                        <select className="select" id="inputLineWidth">
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                        </select>
                    </div>
                </div>
                <div className="inputColorPicker" id="gameOX">
                    <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-controller" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M11.119 2.693c.904.19 1.75.495 2.235.98.407.408.779 1.05 1.094 1.772.32.733.599 1.591.805 2.466.206.875.34 1.78.364 2.606.024.815-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773a11.307 11.307 0 0 1-.739-.809c-.126-.147-.25-.291-.368-.422-.728-.804-1.597-1.527-3.224-1.527-1.627 0-2.496.723-3.224 1.527-.119.131-.242.275-.368.422-.243.283-.494.576-.739.81-.398.378-.877.705-1.513.772a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772.486-.485 1.331-.79 2.235-.98.932-.196 2.03-.292 3.119-.292 1.089 0 2.187.096 3.119.292zm-6.032.979c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a13.748 13.748 0 0 0-.748 2.295 12.351 12.351 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.505C4.861 9.97 5.978 9.026 8 9.026s3.139.943 3.965 1.855c.164.182.307.35.44.505.214.25.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.354 12.354 0 0 0-.339-2.406 13.753 13.753 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27-1.036 0-2.063.091-2.913.27z" />
                        <path d="M11.5 6.026a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1 1a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm2 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1 1a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-7-2.5h1v3h-1v-3z" />
                        <path d="M3.5 6.526h3v1h-3v-1zM3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .258.966l-1.932.518a.5.5 0 0 1-.612-.354zm9.976 0a.5.5 0 0 0-.353-.613l-1.932-.518a.5.5 0 1 0-.259.966l1.932.518a.5.5 0 0 0 .612-.354z" />
                    </svg>
                </div>
                <div className="styleClass" id="eraser">
                    <svg id="eraserId" width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-trash" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                    </svg>
                </div>
                <div className="styleClass" id="undo">
                    <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-arrow-counterclockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z" />
                        <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
                    </svg>
                </div>
                <div className="styleClass" id="rectangle">
                    <svg id="rectangleId" width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                    </svg>
                </div>
                <div className="styleClass" id="line">
                    <svg id="lineId" width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-slash" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M11.354 4.646a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708l6-6a.5.5 0 0 1 .708 0z" />
                    </svg>
                </div>
                <div className="styleClass" id="circle">
                    <svg id="circleId" width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    </svg>
                </div>
                <div className="styleClass" id="clearFile">
                    <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-file-earmark" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 0h5.5v1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h1V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
                        <path d="M9.5 3V0L14 4.5h-3A1.5 1.5 0 0 1 9.5 3z" />
                    </svg>
                </div>
                <div className="styleClass d-flex" id="uploadImage">
                    <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-file-earmark-arrow-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 0h5.5v1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h1V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
                        <path d="M9.5 3V0L14 4.5h-3A1.5 1.5 0 0 1 9.5 3z" />
                        <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-2-2a.5.5 0 0 0-.708 0l-2 2a.5.5 0 1 0 .708.708L7.5 7.707V11.5a.5.5 0 0 0 .5.5z" />
                    </svg>
                    <input id="inputImage" className="inputImage" type="file" hidden />
                </div>
                <div className="styleClass d-flex align-items-center">
                    <svg id="exportCanvasToImage" width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-file-earmark-arrow-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 0h5.5v1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h1V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" />
                        <path d="M9.5 3V0L14 4.5h-3A1.5 1.5 0 0 1 9.5 3z" />
                        <path fillRule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 10.293V6.5A.5.5 0 0 1 8 6z" />
                    </svg>
                    <input id="fileNameId" className="inputFileName" type="text" placeholder="File name" />
                </div>
                <div className="styleClass">
                    <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-fonts" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.258 3H3.747l-.082 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.43.013c1.935.062 2.434.301 2.694 1.846h.479L12.258 3z" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default Board