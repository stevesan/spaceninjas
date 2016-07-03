

using UnityEngine;
using System.Collections;

// Keeps the object rotated towards a target
public class PointAt : MonoBehaviour {
    public Transform target;

    void Update() {
        Vector3 dir = (target.position - transform.position).normalized;
        Vector3 up = Vector3.Cross( dir, -1 * Vector3.forward );
        transform.rotation = Quaternion.LookRotation( Vector3.forward, up );
    }
}
