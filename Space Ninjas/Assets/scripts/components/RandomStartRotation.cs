using UnityEngine;
using System.Collections;

public class RandomStartRotation : MonoBehaviour {

    void Start() {
        transform.Rotate(Vector3.forward, Random.value * 360f );
    }
}
