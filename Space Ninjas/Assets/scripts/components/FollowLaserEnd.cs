

using UnityEngine;
using System.Collections;

public class FollowLaserEnd : MonoBehaviour {
    public LaserBeam laser;

    void LateUpdate() {
        transform.position = laser.GetEndPoint();
    }
}
