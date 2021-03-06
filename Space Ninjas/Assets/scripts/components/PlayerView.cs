﻿using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using Diag = System.Diagnostics;

// Effects for player state and events
public class PlayerView : MonoBehaviour, Player.EventHandler
{

  public TrailRenderer trail;
  public AudioClip boostClip;
  public AudioClip doubleBoostClip;
  public AudioClip restClip;
  public AudioClip outOfBoostsClip;
  public AudioClip pickupCoinClip;
  public AudioClip healClip;

  public GameObject enableDuringDash;
  public ParticleSystem dashParticles;

  private Player player;
  public Renderer render;
  private AudioSource audioSource;
  private float volume = 0.5f;

  public Animator anim;

  public Transform camShakeOffsetTransform;
  public Transform camLookAheadTransform;
  public Transform foot;

  public Renderer attackChargeRender;

  public GameObject spawnOnRest;

  private static class AnimParams
  {
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

    if (isDash)
    {
      audioSource.PlayOneShot(doubleBoostClip, volume);
      TriggerCamShake(0.1f);
    }
    else
    {
      audioSource.PlayOneShot(boostClip, volume);
    }

    enableDuringDash.SetActive(isDash);
    //dashParticles.enableEmission = isDash;
    //dashParticles.gameObject.SetActive(true);

    anim.SetBool(AnimParams.flying, !isDash);
    anim.SetBool(AnimParams.standing, false);
    anim.SetBool(AnimParams.dashing, isDash);

    render.transform.up = dir.GetVector2();
  }

  public void OnOutOfBoosts()
  {
    audioSource.PlayOneShot(outOfBoostsClip, volume);
  }

  public void OnRest(Vector3 normal)
  {
    audioSource.PlayOneShot(restClip, volume);

    render.transform.up = normal;

    anim.SetBool(AnimParams.flying, false);
    anim.SetBool(AnimParams.standing, true);
    anim.SetBool(AnimParams.dashing, false);

    enableDuringDash.SetActive(false);
    dashParticles.enableEmission = false;

    if (spawnOnRest != null)
    {
      GameObject.Instantiate(spawnOnRest, render.transform.position - 0.5f * render.transform.up, render.transform.rotation);
    }
  }

  public void OnPickupCoin()
  {
    audioSource.PlayOneShot(pickupCoinClip, volume);
  }

  public void OnHealthChange(bool isHeal)
  {
    if (isHeal)
    {
      audioSource.PlayOneShot(healClip, volume);
    }
  }

  // Use this for initialization
  void Start()
  {
    player = GetComponent<Player>();
    audioSource = GetComponent<AudioSource>();
    var scope = GetComponentInParent<GameScope>();
    main = scope.Get<Main>();

    enableDuringDash.SetActive(false);
    dashParticles.enableEmission = false;
  }

  // Update is called once per frame
  void Update()
  {
    UpdateCamShake();
    UpdateCamLookAhead();

    if (isGraceFlickering)
    {
      render.enabled = Util.SquareWave(graceFlickerFreq);
    }
    else
    {
      render.enabled = true;
    }

    attackChargeRender.material.SetFloat("_FullAmount", player.GetAttackCharge());
    attackChargeRender.material.SetFloat("_Segments", Player.maxAttackCharge);
  }

  public void OnGracePeriodChange(bool isGracePeriod)
  {
    isGraceFlickering = isGracePeriod;
  }

  //----------------------------------------
  //  Cam shake
  //  TODO move this out of here..
  //  Should be its own component that is injected via GameScope.
  //----------------------------------------
  private static float CamShakeDecayTime = 0.5f;
  private float shakeTimeRemain = 0f;
  private float currMag = 0f;

  void TriggerCamShake(float mag)
  {
    shakeTimeRemain = CamShakeDecayTime;
    currMag = mag;
  }

  void UpdateCamShake()
  {
    float shakeFrac = (CamShakeDecayTime - shakeTimeRemain) / CamShakeDecayTime;
    if (shakeFrac > 1f)
    {
      camShakeOffsetTransform.localPosition = Vector3.zero;
    }
    else
    {
      float mag = currMag * (1.0f - shakeFrac);
      camShakeOffsetTransform.localPosition = mag * UnityEngine.Random.insideUnitCircle.AsXY();
      shakeTimeRemain -= Time.unscaledDeltaTime;
    }
  }

  public void OnLandedHit(GameObject victim)
  {
    bool killed = Health.IsDead(victim);
    // TODO could do something else if killed..
    TriggerCamShake(0.2f);
    main.TriggerBulletTime(0.0f, 0.15f);
  }

  public static float aheadMagnitude = 0.0f;
  public static float dashAheadMagnitude = 0f;
  public static float lookAheadMaxSpeed = 3.0f;

  public static float recenterDelaySecs = 0.2f;
  public static float recenterMaxSpeed = 10f;

  // State
  private Vector2 lookAheadDampVelocity = Vector2.zero;
  private float recenterTimerSecs = 1f;

  void ApplyCameraLookAhead(Vector2 targetOffset, float maxSpeed)
  {
    camLookAheadTransform.localPosition = Vector2.SmoothDamp(
            camLookAheadTransform.localPosition.GetXY(),
            targetOffset,
            ref lookAheadDampVelocity,
            0.1f,   // This time doesn't matter much. It's really the max speed that matters.
            maxSpeed,
            Time.deltaTime);
  }

  void UpdateCamLookAhead()
  {
    if (aheadMagnitude == 0 && dashAheadMagnitude == 0)
    {
      return;
    }

    if (player.IsMoving())
    {
      float mag = player.IsDashing() ? dashAheadMagnitude : aheadMagnitude;
      ApplyCameraLookAhead(
              player.GetLastMoveDir().GetVector2() * mag,
              lookAheadMaxSpeed);
      recenterTimerSecs = recenterDelaySecs;
    }
    else
    {
      recenterTimerSecs -= Time.deltaTime;

      if (recenterTimerSecs < 0f)
      {
        // Recenter
        ApplyCameraLookAhead(Vector2.zero, recenterMaxSpeed);
      }
      else
      {
        // Do nothing. It feels bad to immediately recenter upon stopping.
      }
    }
  }
}
