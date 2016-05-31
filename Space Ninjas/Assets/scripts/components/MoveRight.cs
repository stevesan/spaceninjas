using UnityEngine;
using System.Collections;

public class MoveRight : MonoBehaviour {

    public float speed = 5f;

	// Update is called once per frame
	void Update() {
        transform.Translate(Vector3.right * speed * Time.deltaTime);
	}

}
