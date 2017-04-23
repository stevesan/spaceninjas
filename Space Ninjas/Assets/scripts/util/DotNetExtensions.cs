
using System.IO;

public static class DotNetExtensions {
    public static long SecsToMillis(this float secs) {
        return (long)(secs * 1000f);
    }
}
