using UnityEngine;
using System.Collections;

public class Bobber : MonoBehaviour {

    private Rigidbody2D rb;

    private Vector3 origPos;

    private Vector2 axis;

    private float forceScale = 0.1f;

	// Use this for initialization
	void Start () {
        rb = GetComponent<Rigidbody2D>();
        origPos = transform.position;

        axis = Vector3.right.GetXY().Rotated(Random.value * 360f);
	}
	
	// Update is called once per frame
	void Update () {
        transform.position = origPos + axis.AsXY() * (2f*Mathf.Sin(Time.time*2*Mathf.PI*0.5f));
	}

}
