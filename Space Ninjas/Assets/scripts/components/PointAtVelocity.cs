using UnityEngine;
using System.Collections;

public class PointAtVelocity : MonoBehaviour {
    private Rigidbody2D rb;

    void Start() {
        rb = GetComponent<Rigidbody2D>();
    }

    void FixedUpdate() {
        if(rb.velocity.magnitude > 1e-1) {
            transform.rotation = Util.UpRotation(rb.velocity);
        }
    }
}
