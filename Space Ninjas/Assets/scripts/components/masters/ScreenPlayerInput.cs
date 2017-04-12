
using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;
using System;

// player controls via screen, ie. mouse or touch
// Also, has key board controls, just for convenience
public class ScreenPlayerInput : Player.Input, MasterComponent {
    private static Dictionary<Dir2D, KeyCode> DIR_TO_KEYCODE = new Dictionary<Dir2D, KeyCode>()
    {
        { Dir2D.Right, KeyCode.RightArrow },
        { Dir2D.Up, KeyCode.UpArrow },
        { Dir2D.Left, KeyCode.LeftArrow },
        { Dir2D.Down, KeyCode.DownArrow }
    };

    public RectTransform inputRegion;

    private string state = "idle";
    private bool triggeringAny = false;
    private Dir2D triggeringMove;
    private Dir2D heldMove;

    private static Vector2 GetScreenCenter() {
        return new Vector2(Screen.width/2f, Screen.height/2f);
    }

    // reused
    private Vector3[] inputRegionCorners = new Vector3[4];

    private Vector2 GetInputRegionCenter() {
        inputRegion.GetWorldCorners(inputRegionCorners);
        return (inputRegionCorners[0] 
            + inputRegionCorners[1]
            + inputRegionCorners[2]
            + inputRegionCorners[3])
            / 4f;
    }

    private bool IsScreenPosForDirection( Vector2 screenPos, Dir2D dir ) {
        Vector2 fromCenter = screenPos - GetInputRegionCenter();
        return Vector2.Angle(fromCenter, dir.GetVector2()) < 45f;
    }

    private bool IsTouchTriggeringMove( Dir2D dir ) {
        foreach( var touch in Input.touches ) {
            if( touch.phase == TouchPhase.Began ) {
                if( IsScreenPosForDirection(touch.position, dir) ) {
                    return true;
                }
            }
        }

        return false;
    }

    private bool IsTouchHoldingMove( Dir2D dir ) {
        foreach( var touch in Input.touches ) {
            if( touch.phase == TouchPhase.Stationary || touch.phase == TouchPhase.Moved ) {
                if( IsScreenPosForDirection(touch.position, dir) ) {
                    return true;
                }
            }
        }

        return false;
    }

    private bool IsMouseTriggeringMove( Dir2D dir ) {
        // check mouse
        if( Input.GetMouseButtonDown(0) ) {
            return IsScreenPosForDirection(Input.mousePosition, dir);
        }
        return false;
    }

    private bool IsMouseHoldingMove( Dir2D dir ) {
        // check mouse
        if( Input.GetMouseButton(0) ) {
            return IsScreenPosForDirection(Input.mousePosition, dir);
        }
        return false;
    }

    public override bool IsTriggerMove( Dir2D dir ) {
        return Input.GetKeyDown(DIR_TO_KEYCODE[dir])
            || (triggeringAny && dir == triggeringMove);
    }

    public override void PreUpdate(float dt) {
        if( state == "idle" ) {
            triggeringAny = false;
            foreach( Dir2D dir in Dir2DMethods.GetDirs() ) {
                if(IsMouseTriggeringMove(dir) || IsTouchTriggeringMove(dir)) {
                    triggeringAny = true;
                    triggeringMove = dir;
                    break;
                }
            }

            if( triggeringAny ) {
                state = "held";
            }
        }
        else if( state == "held" ) {
            // if still holding, but moved to a different dir, register this as a trigger
            // but if it's the same one, don't trigger
            triggeringAny = false;
            bool anyHeld = false;
            foreach( Dir2D dir in Dir2DMethods.GetDirs() ) {
                if( IsMouseHoldingMove(dir) || IsTouchHoldingMove(dir) ) {
                    heldMove = dir;
                    anyHeld = true;
                    if( dir != triggeringMove ) {
                        // still holding, but changed dir. register as a trigger.
                        triggeringAny = true;
                        triggeringMove = dir;
                    }
                    break;
                }
            }

            if( !anyHeld ) {
                state = "idle";
            }
        }
    }

    public override bool IsHoldingMove( Dir2D dir ) {
        return state == "held" && heldMove == dir
            || Input.GetKey(DIR_TO_KEYCODE[dir]);
    }
}
