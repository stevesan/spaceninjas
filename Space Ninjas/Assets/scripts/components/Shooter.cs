using UnityEngine;
using System.Collections;

// Shoots at the player
public class Shooter : MonoBehaviour {

    public float maxPlayerDist = 10f;

    // we assume the bullet is pointing to the right by default
    public GameObject bulletPrefab;

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
        inst.transform.parent = null;
        inst.SetActive(true);
    }

    void Start() {
        bulletPrefab.SetActive(false);
    }

    void Update() {
        Player p = Player.GetLocalPlayer();
        if( p != null
                && Vector3.Distance(transform.position, p.transform.position) < maxPlayerDist ) {
            if( Time.time - lastShotTime > cooldown ) {
                ShootAt(p.transform.position);
                lastShotTime = Time.time;
            }
        }
    }
}
