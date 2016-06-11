using UnityEngine;
using System.Collections;

// Destroy gameObject after some fixed time
public class DieTimer : MonoBehaviour {

    public float dieSeconds = 5f;

    private float timer = 0f;

	void Start () {
        timer = dieSeconds;
	}
	
	// Update is called once per frame
	void Update () {
        timer -= Time.deltaTime;
        if( timer <= 0f ) {
            Object.Destroy(gameObject);
        }
	}
}
