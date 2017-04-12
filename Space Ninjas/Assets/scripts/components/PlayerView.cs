using UnityEngine;
using UnityEngine.UI;
using System.Collections;

// Effects for player state and events
public class PlayerView : MonoBehaviour, Player.EventHandler {

    public TrailRenderer trail;
    public AudioClip boostClip;
    public AudioClip doubleBoostClip;
    public AudioClip restClip;
    public AudioClip outOfBoostsClip;
    public AudioClip pickupCoinClip;
    public AudioClip healClip;

    public GameObject enableDuringDash;

    private Player player;
    public Renderer render;
    private AudioSource audioSource;
    private float volume = 0.5f;

    public Animator anim;

    public Transform shakeCamRoot;

    private static class AnimParams {
        public static int flying = Animator.StringToHash("flying");
        public static int standing = Animator.StringToHash("standing");
        public static int dashing = Animator.StringToHash("dashing");
    }

    private float graceFlickerFreq = 8f;
    private bool isGraceFlickering = false;

    public void OnMove(bool isDash, Dir2D dir)
    {
        trail.enabled = true;
        //trail.time = 0.1f;

        if(isDash) {
            audioSource.PlayOneShot(doubleBoostClip, volume);
        }
        else {
            audioSource.PlayOneShot(boostClip, volume);
        }

        enableDuringDash.SetActive(isDash);

        anim.SetBool(AnimParams.flying, !isDash);
        anim.SetBool(AnimParams.standing, false);
        anim.SetBool(AnimParams.dashing, isDash);

        render.transform.up = dir.GetVector2();
    }

    public void OnOutOfBoosts() {
        //audioSource.PlayOneShot(outOfBoostsClip, volume);
    }

    public void OnRest(Vector3 normal)
    {
        audioSource.PlayOneShot(restClip, volume);

        render.transform.up = normal;

        anim.SetBool(AnimParams.flying, false);
        anim.SetBool(AnimParams.standing, true);
        anim.SetBool(AnimParams.dashing, false);

        enableDuringDash.SetActive(false);
    }

    public void OnPickupCoin() {
        audioSource.PlayOneShot(pickupCoinClip, volume);
    }

    public void OnHealthChange(bool isHeal) {
        if(isHeal) {
            audioSource.PlayOneShot(healClip, volume);
        }
    }

    // Use this for initialization
    void Start () {
        player = GetComponent<Player>();
        audioSource = GetComponent<AudioSource>();

        StartCamShake();
	}
	
	// Update is called once per frame
	void Update() {
        UpdateCamShake();

        if( isGraceFlickering ) {
            render.enabled = Util.SquareWave(graceFlickerFreq);
        }
        else {
            render.enabled = true;
        }
	}

    public void OnGracePeriodChange(bool isGracePeriod) {
        isGraceFlickering = isGracePeriod;
    }

    //----------------------------------------
    //  Cam shake
    //  TODO move this out of here..
    //----------------------------------------
    private static float CamShakeDecayTime = 0.5f;
    private float camShakeStart = 0f;
    private Vector3 camOrigLocalPos;

    public void StartCamShake() {
        camOrigLocalPos = shakeCamRoot.localPosition;
    }

    public void UpdateCamShake() {
        float shakeFrac = (Time.time - camShakeStart) / CamShakeDecayTime;
        if(shakeFrac > 1f) {
            shakeCamRoot.localPosition = camOrigLocalPos;
        }
        else {
            float mag = 0.15f * (1.0f - shakeFrac);
            shakeCamRoot.localPosition = camOrigLocalPos + mag * UnityEngine.Random.insideUnitCircle.AsXY();
        }
    }

    public void OnLandedHit(GameObject victim) {
        bool killed = Health.IsDead(victim);
        camShakeStart = Time.time;
    }
}
