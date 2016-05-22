using UnityEngine;
using System.Collections;

public class Firefly : MonoBehaviour {

    private Rigidbody2D rb;

    private Vector3 origPos;

    private float forceScale = 0.1f;

	// Use this for initialization
	void Start () {
        rb = GetComponent<Rigidbody2D>();
        origPos = transform.position;
	}
	
	// Update is called once per frame
	void Update () {
        transform.position = origPos + new Vector3( 2f*Mathf.Sin(Time.time*2*Mathf.PI*0.5f), 0f, 0f );
	}

}
