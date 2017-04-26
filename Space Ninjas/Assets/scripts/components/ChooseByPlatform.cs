using UnityEngine;
using System.Collections;

// Effects for player state and events
public class ChooseByPlatform : MonoBehaviour {
    public GameObject touchDevice;
    public GameObject desktop;

    void Awake() {
#if UNITY_IOS
        GameObject.Destroy(desktop);
#elif UNITY_ANDROID
        GameObject.Destroy(desktop);
#else
        GameObject.Destroy(touchDevice);
#endif
    }
}
