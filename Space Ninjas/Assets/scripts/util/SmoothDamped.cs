
using UnityEngine;

// When you need to spawn something and want to specify how
[System.Serializable]
public class SmoothDamped
{
    public float initValue = 0f;
    public float goalValue = 1f;
    public float initVelocity = 0f; // non-zero is useful for non-monotonic curves
    public float smoothTime = 1f;

    private float currValue = 0f;
    private float velocity = 0f;

    public void Reset()
    {
        currValue = initValue;
        velocity = initVelocity;
    }

    public void ForceValue(float val) { currValue = val; }

    public void Update()
    {
        currValue = Mathf.SmoothDamp( currValue, goalValue, ref velocity, smoothTime );
    }

    public float Get() {
        return currValue;
    }
}
