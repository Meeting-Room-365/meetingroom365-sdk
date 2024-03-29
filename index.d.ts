declare namespace Meetingroom365 {}

declare interface Meetingroom365 {
    init<T>(configuration?: T): void;
    updateStatus<T>(status?: T): void;
}

export = Meetingroom365;