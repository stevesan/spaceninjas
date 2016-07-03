using UnityEngine;
using System.Collections;

public class Spinner : MonoBehaviour {

    public float degreesPerSec = 45f;


    void Start() {
        // random offset initial rotation
        transform.Rotate(Vector3.forward * Random.value * 360f);
    }

	// Update is called once per frame
	void Update() {
        transform.Rotate(Vector3.forward * degreesPerSec * Time.deltaTime);
	}

}
