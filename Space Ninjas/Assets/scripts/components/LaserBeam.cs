
using UnityEngine;
using System.Collections;

public class LaserBeam : MonoBehaviour {

    // Shared buffer. Obviously not thread-safe, should be immediately used and read, etc.
    private static RaycastHit2D[] SHARED_HIT_BUFFER = new RaycastHit2D[64];

    // any objects in this subtree will be ignored
    public Transform ignoreRoot;
    public LineRenderer line;
    public float maxDist = 10f;

    private Vector3 endPoint;

    void UpdateHit() {
        Physics2D.queriesHitTriggers = false;
        Vector3 dir = transform.TransformDirection(Vector3.right);
        int numHits = Physics2D.RaycastNonAlloc( transform.position, dir, SHARED_HIT_BUFFER, maxDist );

        for( int i = 0; i < numHits; i++ ) {
            var hit = SHARED_HIT_BUFFER[i];
            if(hit.transform != ignoreRoot && !hit.transform.IsChildOf(ignoreRoot)) {
                endPoint = hit.point;
                // hits are sorted by ascending distance
                return;
            }
        }

        // not valid hit - set end point to max distance
        endPoint = transform.position + maxDist * dir;
    }

    public Vector3 GetEndPoint() { return endPoint; }

    void UpdateLineRenderer()
    {
        if(line == null) {
            return;
        }

        line.SetPosition(0, transform.position);
        line.SetPosition(1, endPoint);
    }

    void Update() {
        UpdateHit();
        UpdateLineRenderer();
    }
}
