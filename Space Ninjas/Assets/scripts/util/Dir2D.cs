using UnityEngine;
using System.Collections;

public enum Dir2D { Right = 0, Up = 1, Left = 2, Down = 3 };

public static class Dir2DMethods {

    // TODO do this using Enum.GetValues somehow..
    private static readonly Dir2D[] DirsArray = {Dir2D.Right, Dir2D.Up, Dir2D.Left, Dir2D.Down};

    public static Dir2D[] GetDirs() {
        return DirsArray;
    }

    public static Vector3 GetXYVector3( this Dir2D dir ) {
        var v2 = dir.GetVector2();
        return new Vector3(v2.x, v2.y, 0);
    }

    public static Vector2 GetVector2( this Dir2D dir ) {
        switch(dir) {
            case Dir2D.Right: return new Vector2(1, 0);
            case Dir2D.Up: return new Vector2(0, 1);
            case Dir2D.Left: return new Vector2(-1, 0);
            case Dir2D.Down: return new Vector2(0, -1);
            default: return Vector2.zero;
        }
    }
}
