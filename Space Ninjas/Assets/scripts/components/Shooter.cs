using UnityEngine;
using System.Collections;

// Shoots at the player
public class Shooter : MonoBehaviour {

    public float maxTargetDist = 10f;

    // we assume the bullet is pointing to the right by default
    public GameObject bulletPrefab;

    // Which object should we shoot towards - usually the player
    public Transform target;

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
        inst.transform.parent = GetComponentInParent<Main>().transform;
        inst.SetActive(true);
    }

    void Awake() {
        if(target == null) {
            target = GetComponentInParent<Main>().GetPlayer().transform;
        }
    }

    void Start() {
        bulletPrefab.SetActive(false);
    }

    void Update() {
        if( Vector3.Distance(transform.position, target.position) < maxTargetDist ) {
            if( Time.time - lastShotTime > cooldown ) {
                ShootAt(target.position);
                lastShotTime = Time.time;
            }
        }
    }
}
