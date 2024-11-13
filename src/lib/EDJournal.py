from io import SEEK_END
import json
from os import listdir
from os.path import join, isfile, getmtime
from queue import Queue
from sys import platform
import threading
from time import sleep
import traceback
from typing import TypedDict

from .Logger import log

class JournalEntry(TypedDict):
    id: str
    timestamp: str
    event: str

class EDJournal:
    def __init__(self, game_events: dict[str, dict[str, bool]], path_logs: str | None = None):
        self.events: Queue[JournalEntry] = Queue()
        self.logs_path = self.get_logs_path(path_logs)
        
        self.historic_events: list[JournalEntry] = []
        self.load_timestamp: str = '1970-01-01T00:00:00Z'
        self.load_history()
        
        thread = threading.Thread(target=self._reading_loop)
        thread.daemon = True
        thread.start()
    
    def get_event_id(self, log: str, file_index: int) -> str:
        return log.replace('\\', '/').split('/')[-1] + '.' + str(file_index).zfill(6)
        
        
    def load_history(self):
        latest_log = self.get_latest_log()
        if latest_log is None:
            return

        with open(latest_log, 'r') as f:
            file_index = 0
            # read the file from start to finish, line by line
            for line in f:
                file_index += 1
                try:
                    entry: JournalEntry = json.loads(line)
                    entry['id'] = self.get_event_id(latest_log, file_index)
                    self.historic_events.append(entry)
                    self.load_timestamp = entry.get("timestamp")
                except json.JSONDecodeError:
                    continue

    def _reading_thread(self):
        backoff = 1
        while True:
            try: 
                self._reading_loop()
            except Exception as e:
                log('error', 'An error occurred during journal processing', e, traceback.format_exc())
                sleep(backoff)
                log('info', 'Attempting to restart journal processing after failure')
                backoff *= 2
    
    def _reading_loop(self):
        while True:
            latest_log = self.get_latest_log()
            if latest_log is None:
                sleep(1)
                continue
            with open(latest_log, 'r') as f:
                file_index = 0
                while True: # TODO we need to check if there is a new file
                    file_index += 1
                    line = f.readline() # this is blocking, so we need to check if the file has changed somehow
                    try:
                        entry: JournalEntry = json.loads(line)
                        entry['id'] = self.get_event_id(latest_log, file_index)
                        if self.historic_events and self.historic_events[-1].get('id') >= entry.get('id'):
                            continue
                        self.events.put(entry)
                    except json.JSONDecodeError:
                        sleep(0.1)
                        continue
                    
    def get_logs_path(self, path_logs: str | None) -> str:
        """Returns the full path of the latest (most recent) elite log file (journal) from specified path"""
        if path_logs:
            return path_logs
        elif platform == 'win32':
            from . import WindowsKnownPaths as winpaths
            saved_games = winpaths.get_path(winpaths.FOLDERID.SavedGames, winpaths.UserHandle.current) 
            if saved_games is None:
                raise FileNotFoundError("Saved Games folder not found")
            return saved_games + "\\Frontier Developments\\Elite Dangerous"
        else:
            return './linux_ed'

    def get_latest_log(self):
        try:
            list_of_logs = [join(self.logs_path, f) for f in listdir(self.logs_path) if
                            isfile(join(self.logs_path, f)) and f.startswith('Journal.')]
        except:
            return None
        if not list_of_logs:
            return None
        latest_log = max(list_of_logs, key=getmtime)
        return latest_log



def main():
    jn = EDJournal({})
    while True:
        sleep(0.1)
        while not jn.events.empty():
            print(jn.events.get())


if __name__ == "__main__":
    main()
