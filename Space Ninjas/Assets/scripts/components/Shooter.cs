using UnityEngine;
using System.Collections;

// Shoots at the player
public class Shooter : MonoBehaviour {

    public float maxTargetDist = 10f;

    // we assume the bullet is pointing to the right by default
    public GameObject bulletPrefab;

    // Which object should we shoot towards - usually the player
    public Player targetPlayer;

    // min seconds between shots
    public float cooldown = 2f;

    private float lastShotTime = 0f;

    public void ShootAt(Vector3 pos) {
        Vector3 dir = (pos - transform.position).normalized;
        // assume prefab is pointing right
        Quaternion rot = Quaternion.FromToRotation(Vector3.right, dir);

        GameObject inst = (GameObject)GameObject.Instantiate(bulletPrefab,
                transform.position, rot );
        inst.name = bulletPrefab.name + " (shot from " + gameObject.name + ")";
        inst.transform.parent = GetComponentInParent<GameScope>().transform;
        inst.SetActive(true);
    }

    void Start() {
        if(targetPlayer == null) {
            targetPlayer = GetComponentInParent<GameScope>().Get<Player>();
        }
    }

    void Update() {
        if( targetPlayer.CanSee(transform, 0.5f, 1.0f) ) {
            if( Time.time - lastShotTime > cooldown ) {
                ShootAt(targetPlayer.transform.position);
                lastShotTime = Time.time;
            }
        }
    }
}
