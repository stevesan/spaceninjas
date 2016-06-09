
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// Layer between Unity's inputs to game-specific controls
public class GameInput {

    private static Dictionary<Dir2D, KeyCode> DIR_TO_KEYCODE = new Dictionary<Dir2D, KeyCode>()
    {
        { Dir2D.Right, KeyCode.RightArrow },
        { Dir2D.Up, KeyCode.UpArrow },
        { Dir2D.Left, KeyCode.LeftArrow },
        { Dir2D.Down, KeyCode.DownArrow }
    };

    public static Vector2 GetScreenCenter() {
        return new Vector2(Screen.width/2f, Screen.height/2f);
    }

    public bool IsScreenPosForDirection( Vector2 screenPos, Dir2D dir ) {
        Vector2 fromCenter = screenPos - GetScreenCenter();
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

    public bool IsTriggerMove( Dir2D dir ) {
        return Input.GetKeyDown( DIR_TO_KEYCODE[dir] ) ||
            (UIInputHandler.Instance == null && (IsTouchTriggeringMove(dir) || IsMouseTriggeringMove(dir))) ||
            (UIInputHandler.Instance != null && UIInputHandler.Instance.IsTriggerMove(dir));
    }

    public bool IsHoldingMove( Dir2D dir ) {
        return Input.GetKey( DIR_TO_KEYCODE[dir] ) ||
            (UIInputHandler.Instance == null && (IsTouchHoldingMove(dir) || IsMouseHoldingMove(dir))) ||
            (UIInputHandler.Instance != null && UIInputHandler.Instance.IsHoldingMove(dir));
    }
}
