﻿using UnityEngine;
using System.Collections;

public enum Dir2D { Right = 0, Up = 1, Left = 2, Down = 3 };

public enum Axis2D { X = 0, Y = 1 };

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
            default: throw new System.ArgumentException("Bad Dir2D value: " + dir);
        }
    }

    public static Axis2D GetAxis(this Dir2D dir) {
        switch(dir) {
            case Dir2D.Right: return Axis2D.X;
            case Dir2D.Up: return Axis2D.Y;
            case Dir2D.Left: return Axis2D.X;
            case Dir2D.Down: return Axis2D.Y;
            default: throw new System.ArgumentException("Bad Dir2D value: " + dir);
        }
    }
}
