
using UnityEngine;
using UnityEngine.UI;
using System;

public class FrameTimeDisplay : MonoBehaviour {
    public int windowSize = 10;
    public Text text;

    private float[] samples;

    private int sampleCount = 0;

    void Awake() {
        samples = new float[windowSize];
    }

    float computeAverage() {
        float total = 0f;
        for( int i = 0; i < samples.Length; i++ ) {
            total += samples[i];
        }
        return total / samples.Length;
    }

    void Update() {
        if( Time.timeScale < 1e-4 ) {
            // we are likely paused
            // reset sample window and ignore
            sampleCount = 0;
        }
        else {
            samples[sampleCount % samples.Length] = Time.deltaTime / Time.timeScale;
            sampleCount++;

            if( sampleCount > windowSize ) {
                float meanMs = computeAverage() * 1000f;
                text.text = Math.Round((Decimal)meanMs, 2) + " ms";
            }
        }
    }
}
