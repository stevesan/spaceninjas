
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public struct Int2
{
    private int a;
    private int b;

    public Int2(int _a, int _b) {
        this.a = _a;
        this.b = _b;
    }

    public Vector3 AsXYVector3() {
        return new Vector3( (float)a, (float)b );
    }
}
