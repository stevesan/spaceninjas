
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

    public bool IsTriggerMove( Dir2D dir ) {
        return Input.GetKeyDown( DIR_TO_KEYCODE[dir] );
    }

    public bool IsHoldingMove( Dir2D dir ) {
        return Input.GetKey( DIR_TO_KEYCODE[dir] );
    }
}
