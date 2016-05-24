
using UnityEngine;

public static class UnityExtensions {

    public static Vector2 ToVector2XY(this Vector3 v) {
        return new Vector2(v.x, v.y);
    }
}
