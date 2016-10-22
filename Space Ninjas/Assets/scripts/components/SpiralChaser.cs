
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

// Not physics-based.
public class SpiralChaser : MonoBehaviour {

    public Transform target;

    enum State { FirstFrame, Chasing, Rest };
    private State state = State.FirstFrame;
    private float angle = 0f;

    public SmoothDamped angSpeed;
    public SmoothDamped distance;

    Vector3 GetDirToTarget() {
        return (target.position - transform.position).normalized;
    }

    float GetDistToTarget() {
        return Vector3.Distance(target.position, transform.position);
    }

    void Start() {
        if(target == null) {
            target = GetComponentInParent<GameScope>().Get<Player>().transform;
            Debug.Assert(target != null);
        }

        angSpeed.Reset();
        distance.Reset();

        angle = (-1 * GetDirToTarget()).PolarAngleXY() * Mathf.Rad2Deg;
        // randomize start angle a bit
        angle += Random.Range(-30, 30);
        distance.ForceValue( GetDistToTarget() );

        // randomize the direction of rotation
        angSpeed.goalValue *= Random.value < 0.5f ? -1 : 1;

        transform.position = target.position + Util.Polar( distance.Get(), angle );
    }

    // ideal pos moves along a spiral around the target
    Vector3 UpdateIdealPosition(float dt) {
        angSpeed.Update();
        distance.Update();

        angle += angSpeed.Get() * dt;

        return target.position + Util.Polar( distance.Get(), angle );
    }

    void Update() {
        switch(state) {
            case State.FirstFrame:
                state = State.Chasing;
                break;

            case State.Chasing:
                if( GetDistToTarget() < 0.5f ) {
                    GetComponent<SpriteRenderer>().enabled = false;
                    state = State.Rest;
                }
                else {
                    transform.position = UpdateIdealPosition(Time.deltaTime);
                }
                break;

            case State.Rest:
            default:
                break;
        }
    }
}
