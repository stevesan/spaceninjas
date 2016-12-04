
using UnityEngine;
using System.IO;

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

    public static float PolarAngleXY(this Vector3 v) {
        return Mathf.Atan2(v.y, v.x);
    }

    public static string ToStringXY(this Vector3 v) {
        return v.x+","+v.y;
    }

    public static Vector3 ReadVector3(this BinaryReader reader) {
        return new Vector3(
                reader.ReadSingle(),
                reader.ReadSingle(),
                reader.ReadSingle() );
    }

    public static void Write(this BinaryWriter writer, Vector3 v) {
        Debug.Log("writing a vector " + v);
        writer.Write(v.x);
        writer.Write(v.y);
        writer.Write(v.z);
    }

    public static void ReadTransform(this BinaryReader reader, Transform t) {
        t.localPosition = reader.ReadVector3();
    }

    public static void Write(this BinaryWriter writer, Quaternion q) {
        writer.Write(q.x);
        writer.Write(q.y);
        writer.Write(q.z);
        writer.Write(q.w);
    }

    public static void WriteTransform(this BinaryWriter writer, Transform t) {
        // TODO
        Debug.Log("write a transform");
        writer.Write(t.localPosition);
        //writer.Write(t.localRotation);
    }
}
