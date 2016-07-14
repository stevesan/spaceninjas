
using UnityEngine;

public static class UnityExtensions {

    public static Vector2 GetXY(this Vector3 v) {
        return new Vector2(v.x, v.y);
    }

    public static Vector3 AsXY(this Vector2 v) {
        return new Vector3(v.x, v.y, 0f);
    }

    public static void AssertNoOtherMasterComponents( this MonoBehaviour self ) {
        // TODO get all components implementing the MasterComponent - there should only be one
        // and it should be equal to self
    }

    public static void AddStoppingForce( this Rigidbody2D rb ) {
        rb.AddForce( -1 * rb.velocity * rb.mass, ForceMode2D.Impulse );
    }

    public static Vector2 Rotated( this Vector2 v, float degrees ) {
        float rads = degrees * Mathf.Deg2Rad;
        float c = Mathf.Cos(rads);
        float s = Mathf.Sin(rads);
        return new Vector2( v.x * c - v.y * s, v.x * s + v.y * c );
    }

    public static void PointRightAt(this Transform transform, Vector3 target) {
        transform.rotation = Util.RightRotation((target - transform.position).normalized);
    }
}
