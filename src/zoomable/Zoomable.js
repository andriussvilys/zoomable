import React, { useEffect, useRef, useState } from 'react';
import { useGesture, useDrag } from 'react-use-gesture'
import styles from './css/styles.module.css'

const Zoomable = () => {

    const contentRef = useRef();

    const [testRect, updateTestRect] = useState({
        x: null,
        y: null,
        left: null,
        top: null,
        height: null,
        width: null
    })

    const [dragState, updateDragState] = useState({
        isClicked: null,
        x: 0,
        y: 0,
        velocity: 0
    })

    const [pinchState, updatePinchState] = useState({
        active: false,
        origin: [0, 0],
        scale: 1
    })

    const [pinches, addPinch] = useState([])

    const pan = (state, string) => {

        updateDragState({
            ...dragState,
            x: dragState.x + ( state.delta[0] ),
            y: dragState.y + ( state.delta[1] ),
            velocity: state.velocity
        })

    }

    const setActive = (state, value) => {
        state.event.preventDefault()

        console.log(`draghandle: ${value}`)
        updateDragState({...dragState, isClicked: value})
    }

    const pinchHandler = (state) => {

        state.event.preventDefault()

        console.log(state)

        if(pinchState.active === true)
        {

            const calcScale = () => {
                const temp = 1 + ( state.da[0] / (100) );
                return temp > 1 ? temp : 1
            }
            
            updatePinchState({...pinchState,
                scale: calcScale()
            })
        }

    }

    const getTouchOffset = ( touchCoord ) => {

        // console.log(`touch (absolute) ORIGIN: x: ${touchCoord[0]}, y: ${touchCoord[1]}`)

        const rect = contentRef.current.getBoundingClientRect()
        const x = Math.round(touchCoord[0] - rect.left - pinchState.origin[0])
        const y = Math.round(touchCoord[1] - rect.top - pinchState.origin[1])

        // console.log(`offset: ${x} ${y}`)

        return [x, y]

    }

    const config = {
        domTarget: contentRef,
        eventOptions: {
            passive: false
        }
    };

    const bind = useGesture({

        onPinch: (state) => pinchHandler(state, true),
        onPinchStart: (state) => {

            state.event.preventDefault()
            
            console.log("PINCH START")

            const offset = getTouchOffset(state.origin)

            addPinch([...pinches, offset])

            updatePinchState({
                ...pinchState,
                active: true,
                origin: offset
            })

        },
        onMoveEnd: (state) => {
            console.log(state.touches)
            updatePinchState({...pinchState, 
                active: false, 
                origin: [0, 0],
                scale: 1
            })
        }
        // onPinchEnd: (state) => {
        //     console.log("PINCH END")
        //     console.log(state.touches)
        //     updatePinchState({...pinchState, 
        //         active: false, 
        //         origin: [0, 0],
        //         scale: 1
        //     })
        // }

    }, config)

    const renderPinches = () => {
        if(pinches.length > 0)
        {
            // return pinches.map( (pinch, index) => {
            //     return <div 
            //     style={{
            //         background: "red", 
            //         height: "5px", 
            //         width: "5px",
            //         borderRadius: "5px",
            //         position: "absolute",
            //         left: pinch[0],
            //         top: pinch[1]
            //     }}
            //     key={`pinch_${index}`}
            //     ></div>
            // })
            return <div 
            style={{
                background: "red", 
                height: "5px", 
                width: "5px",
                borderRadius: "5px",
                position: "absolute",
                left: pinches[pinches.length - 1][0],
                top: pinches[pinches.length - 1][1]
            }}
            ></div>
        }
    }

    useEffect(() => {
        if(contentRef && contentRef.current)
        {
            setTimeout(() => {
                
                const rect = contentRef.current.getBoundingClientRect()
                updateTestRect({
                    x: rect.x, 
                    y: rect.y,
                    left: rect.left,
                    top: rect.top,
                    height: rect.height,
                    width: rect.width
                })
            }, 500);
        }
    }, [pinchState])

    useEffect(() => {
        const handleTouch = e => {
            console.log("TOUCH START")
        }
        contentRef.current.addEventListener("touchmove", handleTouch)
    }, [])

    return (
        <div className={styles.container}>

            <div className={"test_env"} style={{position: "fixed", top: 0, left: 0, backgroundColor: "white"}}> 
                <div>
                    <p>x: {testRect.x}</p>
                    <p>y: {testRect.y}</p>
                    <p>left: {testRect.left}</p>
                    <p>top: {testRect.top}</p>
                    <p>height: {testRect.height}</p>
                    <p>width: {testRect.width}</p>
                </div>
                <div>
                    <label>
                        scale:
                        <input 
                            value={pinchState.scale} 
                            // onChange={handleScale} 
                            onChange={(e) => updatePinchState({...pinchState, scale: e.target.value})} 
                        />
                    </label>
                    <div>
                        translate
                        <label>
                            x:
                            <input
                                value={dragState.x}
                                onChange={(e) => updateDragState({...dragState, x: e.target.value})}
                            />
                        </label>

                        <label>
                            y:
                            <input
                                value={dragState.y}
                                onChange={(e) => updateDragState({...dragState, y: e.target.value})}
                            />
                        </label>
                    </div>
                    <div>
                        transform origin:
                        <label>
                            x:
                            <input
                                value={pinchState.origin[0]}
                                onChange={(e) => updatePinchState({...pinchState, origin: [e.target.value, pinchState.origin[1]]})}
                            />
                        </label>

                        <label>
                            y:
                            <input
                                value={pinchState.origin[1]}
                                onChange={(e) => updatePinchState({...pinchState, origin: [pinchState.origin[0], e.target.value]})}
                            />
                        </label>
                    </div>
                </div>
            </div>
            <div className={styles.wrapper}>

                <div 
                    // {...bind()} 
                    style={{
                        transform: `matrix(
                            ${pinchState.scale}, 
                            0, 0, 
                            ${pinchState.scale}, 
                            ${dragState.x},
                            ${dragState.y}
                        )`,
                        transformOrigin: `${pinchState.origin[0]}px ${pinchState.origin[1]}px`
                    }}

                    ref={contentRef} 

                    className={styles.test}
                >
                    {renderPinches()}
                </div>

            </div>

        </div>
    )
}


export default Zoomable;