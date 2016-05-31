using UnityEngine;
using System.Collections;

public class Spinner : MonoBehaviour {

    public float degreesPerSec = 45f;

	// Update is called once per frame
	void Update() {
        transform.Rotate(Vector3.forward * degreesPerSec * Time.deltaTime);
	}

}
