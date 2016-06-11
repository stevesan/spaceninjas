
using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

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


    public static Vector2 GetScreenCenter() {
        return new Vector2(Screen.width/2f, Screen.height/2f);
    }

    // reused
    private Vector3[] inputRegionCorners = new Vector3[4];

    public Vector2 GetInputRegionCenter() {
        inputRegion.GetWorldCorners(inputRegionCorners);
        return (inputRegionCorners[0] 
            + inputRegionCorners[1]
            + inputRegionCorners[2]
            + inputRegionCorners[3])
            / 4f;
    }

    public bool IsScreenPosForDirection( Vector2 screenPos, Dir2D dir ) {
        Vector2 fromCenter = screenPos - GetInputRegionCenter();
        return Vector2.Angle(fromCenter, dir.GetVector2()) < 45f;
    }

    public bool IsTouchTriggeringMove( Dir2D dir ) {
        foreach( var touch in Input.touches ) {
            if( touch.phase == TouchPhase.Began ) {
                if( IsScreenPosForDirection(touch.position, dir) ) {
                    return true;
                }
            }
        }

        return false;
    }

    public bool IsTouchHoldingMove( Dir2D dir ) {
        foreach( var touch in Input.touches ) {
            if( touch.phase == TouchPhase.Stationary || touch.phase == TouchPhase.Moved ) {
                if( IsScreenPosForDirection(touch.position, dir) ) {
                    return true;
                }
            }
        }

        return false;
    }

    public bool IsMouseTriggeringMove( Dir2D dir ) {
        // check mouse
        if( Input.GetMouseButtonDown(0) ) {
            return IsScreenPosForDirection(Input.mousePosition, dir);
        }
        return false;
    }

    public bool IsMouseHoldingMove( Dir2D dir ) {
        // check mouse
        if( Input.GetMouseButton(0) ) {
            return IsScreenPosForDirection(Input.mousePosition, dir);
        }
        return false;
    }

    public override bool IsTriggerMove( Dir2D dir ) {
        return Input.GetKeyDown(DIR_TO_KEYCODE[dir])
            || IsTouchTriggeringMove(dir)
            || IsMouseTriggeringMove(dir);
    }

    public override bool IsHoldingMove( Dir2D dir ) {
        return Input.GetKey( DIR_TO_KEYCODE[dir] )
            || IsTouchHoldingMove(dir)
            || IsMouseHoldingMove(dir);
    }
}
