
using UnityEngine;
using UnityEngine.UI;
using System;
using Diag = System.Diagnostics;

public class FrameTimeDisplay : MonoBehaviour {
    public int windowSize = 10;
    public Text text;

    private long[] samplesDeltaMS;
    private int sampleCount = 0;
    private Diag.Stopwatch watch = new Diag.Stopwatch();
    private long prevMs = -1;

    void Awake() {
        samplesDeltaMS = new long[windowSize];
        watch.Start();
    }

    float computeMeanDtMs() {
        long total = 0L;
        for( int i = 0; i < samplesDeltaMS.Length; i++ ) {
            total += samplesDeltaMS[i];
        }
        return total *1f / samplesDeltaMS.Length;
    }

    private void RecordSample(long dtMs) {
        samplesDeltaMS[ sampleCount % samplesDeltaMS.Length ] = dtMs;
        sampleCount++;
    }

    void Update() {
        long nowMs = watch.ElapsedMilliseconds;
        if(prevMs != -1) {
            RecordSample(nowMs - prevMs);
        }
        prevMs = nowMs;

        if( sampleCount > windowSize ) {
            float meanDtMs = computeMeanDtMs();
            text.text = Math.Round((Decimal)meanDtMs, 2) + " ms";
        }
    }
}
