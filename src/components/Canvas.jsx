import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import canvasState from '../store/canvasState';
import toolState from '../store/toolState';
import "../styles/canvas.scss";
import Brush from '../tools/Brush';
import { Rect } from '../tools/Rect';
import { Circle } from '../tools/Circle';
import { Modal, Button } from 'react-bootstrap'
import { useParams } from 'react-router-dom';

const Canvas = observer(() => {
    const [modal, setModal] = useState(true);

    const canvasRef = useRef();
    const usernameRef = useRef();
    const params = useParams();
    console.log(params)
    useEffect(() => {
        canvasState.setCanvas(canvasRef.current);
    }, []);

    useEffect(() => {
        if (canvasState.username) {
            const socket = new WebSocket('ws://localhost:5000/');
            canvasState.setSocket(socket);
            canvasState.setSessionId(params.id);
            toolState.setTool(new Brush(canvasRef.current, socket, params.id));
            socket.onopen = () => {
                console.log('Ws connection started')
                socket.send(JSON.stringify({
                    id: params.id,
                    username: canvasState.username,
                    method: "connection"
                }))
            }
            socket.onmessage = (event) => {
                let msg = JSON.parse(event.data);
                switch (msg.method) {
                    case "connection":
                        console.log(`${msg.username} connected`)
                        break;
                    case "draw":
                        drawHandler(msg);
                        break;
                }
            }
        }
    }, [canvasState.username]);

    const drawHandler = (msg) => {
        const figure = msg.figure;
        const ctx = canvasRef.current.getContext('2d')
        switch (figure.type) {
            case 'brush':
                Brush.draw(ctx, figure.x, figure.y);
                break;
            case 'rect':
                Rect.staticDraw(ctx, figure.fillColor, figure.strokeColor, figure.lineWidth, figure.x, figure.y, figure.width, figure.height);
                ctx.beginPath();
                break;
            case 'circle':
                Circle.staticDraw(ctx, figure.fillColor, figure.strokeColor, figure.lineWidth, figure.x, figure.y, figure.r);
                break;
            case 'finish':
                ctx.beginPath();
                break;
        }
    }
    const mouseDownHandler = () => {
        canvasState.pushToUndo(canvasRef.current.toDataURL())
    }
    const connectionHandler = () => {
        canvasState.setUsername(usernameRef.current.value)
        setModal(false)
    }
    return (
        <div className="canvas" >
            <Modal show={modal} onHide={() => { }}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter your name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input ref={usernameRef} type='text' />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => connectionHandler()}>
                        Enter
                    </Button>
                </Modal.Footer>
            </Modal>
            <canvas
                onMouseDown={() => mouseDownHandler()}
                ref={canvasRef} width={600} height={400} />
        </div >
    );
});
export default Canvas;