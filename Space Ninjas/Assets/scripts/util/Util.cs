
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class Util
{
    // Assuming +Z for forward, returns a rotation that points the transform's
    // local right in the givne direction
    public static Quaternion RightRotation( Vector3 dir ) {
        Vector3 up = Vector3.Cross( dir, -1 * Vector3.forward );
        return Quaternion.LookRotation( Vector3.forward, up );
    }

    public static bool SquareWave(float freq) {
        return SquareWave(freq, Time.time);
    }

    public static bool SquareWave(float freq, float t) {
        t = t - Mathf.Floor(t);
        int frame = (int)Mathf.Floor( t * freq * 2f );
        return (frame % 2) == 0;
    }
}
