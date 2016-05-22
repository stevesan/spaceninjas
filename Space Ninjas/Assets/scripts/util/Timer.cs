
using UnityEngine;

public class Timer
{
    private float secsRemaining;

    // call this to run down the timer
    // it will return true if the timer is out of time
    public bool Update()
    {
        secsRemaining -= Time.deltaTime;
        return secsRemaining < 0f;
    }

    public void Reset(float secs) {
        secsRemaining = secs;
    }
}
