
using UnityEngine;
using System.Collections;

public class LaserBeam : MonoBehaviour {

    // any objects in this subtree will be ignored
    public Transform ignoreRoot;
    public LineRenderer line;

    private RaycastHit2D[] hitsBuf = new RaycastHit2D[64];
    private RaycastHit2D currHit;

    void UpdateHit() {
        Physics2D.queriesHitTriggers = false;
        int numHits = Physics2D.RaycastNonAlloc(
                transform.position,
                transform.TransformDirection(Vector3.right),
                hitsBuf );

        for( int i = 0; i < numHits; i++ ) {
            var hit = hitsBuf[i];
            if(hit.transform != ignoreRoot && !hit.transform.IsChildOf(ignoreRoot)) {
                currHit = hit;
                // hits are sorted by ascending distance
                return;
            }
        }
    }

    public Vector3 GetEndPoint() { return currHit.point; }

    void UpdateLineRenderer()
    {
        if(line == null) {
            return;
        }

        line.SetPosition(0, transform.position);
        line.SetPosition(1, currHit.point);
    }

    void Update() {
        UpdateHit();
        UpdateLineRenderer();
    }
}
