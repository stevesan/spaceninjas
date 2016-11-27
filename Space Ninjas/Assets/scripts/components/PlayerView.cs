using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System;

// Effects for player state and events
public class PlayerView : MonoBehaviour, Player.EventHandler {

    public TrailRenderer trail;
    public AudioClip boostClip;
    public AudioClip doubleBoostClip;
    public AudioClip restClip;
    public AudioClip outOfBoostsClip;
    public AudioClip pickupCoinClip;
    public AudioClip healClip;

    private Player player;
    public Renderer render;
    private AudioSource audioSource;
    private float volume = 0.5f;

    private float graceFlickerFreq = 8f;
    private bool isGraceFlickering = false;

    public void OnBoost(bool isDash, Dir2D dir)
    {
        trail.enabled = true;
        trail.time = 0.1f;

        if(isDash) {
            audioSource.PlayOneShot(doubleBoostClip, volume);
        }
        else {
            audioSource.PlayOneShot(boostClip, volume);
        }

        //render.transform.up = Vector3.up;
    }

    public void OnOutOfBoosts() {
        //audioSource.PlayOneShot(outOfBoostsClip, volume);
    }

    public void OnRest(Vector3 normal)
    {
        audioSource.PlayOneShot(restClip, volume);

        // TODO dust particle
        render.transform.up = normal;
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
	}
	
	// Update is called once per frame
	void Update() {
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
}
