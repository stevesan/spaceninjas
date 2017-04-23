
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class Util
{
    // Assuming +Z for forward, returns a rotation that points the transform's
    // local right in the given direction
    public static Quaternion RightRotation( Vector3 dir ) {
        Vector3 up = Vector3.Cross( dir, -1 * Vector3.forward );
        return Quaternion.LookRotation( Vector3.forward, up );
    }

    public static Quaternion UpRotation( Vector3 up ) {
        return Quaternion.LookRotation( Vector3.forward, up );
    }

    public static bool SquareWave(float freq) {
        return SquareWave(freq, Time.time);
    }

    // Oscillates between true and false 'freq' times per sec
    public static bool SquareWave(float freq, float t) {
        t = t - Mathf.Floor(t);
        int frame = (int)Mathf.Floor( t * freq * 2f );
        return (frame % 2) == 0;
    }

    public float WaveBetween(float minval, float maxval, float freq, float t) {
        float amp = (maxval - minval) / 2f;
        float center = (maxval + minval) / 2f;
        return center + amp * Mathf.Sin(2f * Mathf.PI * freq * t);
    }

    public static Vector3 Polar(float r, float angleDegs) {
        return new Vector3(
                r * Mathf.Cos(angleDegs * Mathf.Deg2Rad),
                r * Mathf.Sin(angleDegs * Mathf.Deg2Rad));
    }
}
