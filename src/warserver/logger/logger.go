package logger

import (
    "fmt"
    "io"
    "log"
    "os"
)

type Flags int

const (
    USUAL Flags = log.Ldate | log.Ltime | log.Lshortfile
)

type Level int

const (
    DEBUG Level = iota
    INFO
    WARN
    ERROR
    FATAL
)

type LevelLogger struct {
    logger *log.Logger
    level Level
}

var logs LevelLogger

func init() {
    logs.level = DEBUG
}

func SetupLogger(lev Level, flags Flags, w io.Writer) {
    logs.logger = log.New(w, "", int(flags))
    logs.level = lev
}

func logIfLevelf(level Level, format string, v ...interface{}) {
    if (int(level) >= int(logs.level)) {
        logs.logger.Printf(format, v...)
    }
}

func Debugf(format string, v ...interface{}) {
    formatted := fmt.Sprintf(format, v...)
    logIfLevelf(DEBUG, "[DEBUG] %v", formatted)
}

func Debug(v ...interface{}) {
    Debugf("%v", v...)
}

func Infof(format string, v ...interface{}) {
    formatted := fmt.Sprintf(format, v...)
    logIfLevelf(INFO, "[INFO] %v", formatted)
}

func Info(v ...interface{}) {
    Infof("%v", v...)
}

func Warnf(format string, v ...interface{}) {
    formatted := fmt.Sprintf(format, v...)
    logIfLevelf(WARN, "[WARN] %v", formatted)
}

func Warn(v ...interface{}) {
    Warnf("%v", v...)
}

func Errorf(format string, v ...interface{}) {
    formatted := fmt.Sprintf(format, v...)
    logIfLevelf(ERROR, "[ERROR] %v", formatted)
}

func Error(v ...interface{}) {
    Errorf("%v", v...)
}

func Fatalf(format string, v ...interface{}) {
    formatted := fmt.Sprintf(format, v...)
    logIfLevelf(FATAL, "[FATAL] %v", formatted)
    os.Exit(1)
}

func Fatal(v ...interface{}) {
    Fatalf("%v", v...)
}
