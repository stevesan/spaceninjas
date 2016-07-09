

using UnityEngine;
using System.Collections;

// Keeps the object rotated towards a target
public class PointAt : MonoBehaviour {
    public Transform target;

    void Update() {
        Vector3 dir = (target.position - transform.position).normalized;
        transform.rotation = Util.RightRotation(dir);
    }
}
