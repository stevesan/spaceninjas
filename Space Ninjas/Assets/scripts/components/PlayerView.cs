﻿using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using Diag = System.Diagnostics;

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

    public Transform camShakeOffsetTransform;
    public Transform camLookAheadTransform;

    private static class AnimParams {
        public static int flying = Animator.StringToHash("flying");
        public static int standing = Animator.StringToHash("standing");
        public static int dashing = Animator.StringToHash("dashing");
    }

    private float graceFlickerFreq = 8f;
    private bool isGraceFlickering = false;

    private Main main;

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
        var scope = GetComponentInParent<GameScope>();
        main = scope.Get<Main>();
	}
	
	// Update is called once per frame
	void Update() {
        UpdateCamShake();
        UpdateCamLookAhead();

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
    //  Should be its own component that is injected via GameScope.
    //----------------------------------------
    private static float CamShakeDecayTime = 0.5f;
    private float shakeTimeRemain = 0f;

    void TriggerCamShake() {
        shakeTimeRemain = CamShakeDecayTime;
    }

    void UpdateCamShake() {
        float shakeFrac = (CamShakeDecayTime - shakeTimeRemain) / CamShakeDecayTime;
        if(shakeFrac > 1f) {
            camShakeOffsetTransform.localPosition = Vector3.zero;
        }
        else {
            float mag = 0.20f * (1.0f - shakeFrac);
            camShakeOffsetTransform.localPosition = mag * UnityEngine.Random.insideUnitCircle.AsXY();
            shakeTimeRemain -= Time.unscaledDeltaTime;
        }
    }

    public void OnLandedHit(GameObject victim) {
        bool killed = Health.IsDead(victim);
        // TODO could do something else if killed..
        TriggerCamShake();
        main.TriggerBulletTime(0.0f, 0.15f);
    }

    public static float aheadMagnitude = 0f;
    public static float dashAheadMagnitude = 0f;
    public static float AheadTime = 0.5f;
    public static float ReturnTime = 0.5f;
    public static float CamLookAheadMaxSpeed = 999999f;
    private Vector2 camLookAheadDampVelocity = Vector2.zero;

    void UpdateCamLookAhead() {
        if( aheadMagnitude == 0 && dashAheadMagnitude == 0 ) {
            return;
        }

        Vector2 targetOffset = Vector2.zero;
        float dampTime = ReturnTime;

        if( player.IsMoving() ) {
            float mag = player.IsDashing() ? dashAheadMagnitude : aheadMagnitude;
            targetOffset = player.GetLastMoveDir().GetVector2() * mag;
            dampTime = AheadTime;
        }

        camLookAheadTransform.localPosition = Vector2.SmoothDamp(
                camLookAheadTransform.localPosition.GetXY(),
                targetOffset,
                ref camLookAheadDampVelocity,
                dampTime,
                CamLookAheadMaxSpeed,
                Time.deltaTime);
    }
}
