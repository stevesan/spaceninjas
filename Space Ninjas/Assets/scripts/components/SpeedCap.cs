using UnityEngine;
using System.Collections.Generic;

public class SpeedCap : MonoBehaviour {

    public float maxSpeed;
    public float minSpeed = 0f;

    private Rigidbody2D rb;

    void Start() {
        rb = GetComponent<Rigidbody2D>();
    }

    void FixedUpdate() {
        rb.EnforceMaxSpeed(maxSpeed);

        if(rb.velocity.magnitude < minSpeed) {
            // give a small, random bump
            rb.AddVelocity( Random.insideUnitCircle * (minSpeed + 1e-4f) );
        }
    }
}
