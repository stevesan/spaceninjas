﻿using UnityEngine;
using System.Collections;
using System;

public class PlayerBoostEffects : MonoBehaviour, Player.EventHandler {

    public TrailRenderer trail;
    public AudioClip boostClip;
    public AudioClip doubleBoostClip;
    public AudioClip restClip;
    public AudioClip outOfBoostsClip;
    public AudioClip pickupCoinClip;

    private Player player;
    public Renderer render;
    private AudioSource audioSource;
    private float volume = 0.5f;

    private float graceFlickerFreq = 8f;
    private bool isGraceFlickering = false;

    public void OnBoost(int boostsUsed, bool isDouble)
    {
        trail.enabled = true;
        trail.time = 0.1f;

        if(isDouble) {
            audioSource.PlayOneShot(doubleBoostClip, volume);
        }
        else {
            audioSource.PlayOneShot(boostClip, volume);
        }

        RefreshHUD();
    }

    public void OnOutOfBoosts() {
        //audioSource.PlayOneShot(outOfBoostsClip, volume);
    }

    public void OnRest()
    {
        audioSource.PlayOneShot(restClip, volume);
        RefreshHUD();
    }

    public void OnPickupCoin() {
        audioSource.PlayOneShot(pickupCoinClip, volume);
    }

    private void RefreshHUD() {
    }

    public void OnHealthChange(bool isHeal) {
        RefreshHUD();
    }

    // Use this for initialization
    void Start () {
        player = GetComponent<Player>();
        audioSource = GetComponent<AudioSource>();
        RefreshHUD();
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
