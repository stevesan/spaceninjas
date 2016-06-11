
using UnityEngine;

public static class UnityExtensions {

    public static Vector2 ToVector2XY(this Vector3 v) {
        return new Vector2(v.x, v.y);
    }

    public static void AssertNoOtherMasterComponents( this MonoBehaviour self ) {
        // TODO get all components implementing the MasterComponent - there should only be one
        // and it should be equal to self
    }
}
