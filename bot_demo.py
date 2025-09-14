def start(team, team_opponent):
    print("start")

    print("--- my team ---")
    print("stones: ", team.get_stones())
    print("capstones: ", team.get_capstone())
    print("time: ", team.get_time())
    print("lives: ", team.get_lives())

    print("--- opponent team ---")
    print("stones: ", team_opponent.get_stones())
    print("capstones: ", team_opponent.get_capstone())
    print("time: ", team_opponent.get_time())
    print("lives: ", team_opponent.get_lives())

def step(board):
    print("step")

    print("board size:", board.board_size())

    for i in range(0, board.board_size()):
        for j in range(0, board.board_size()):
            print(f"board[{i},{j}]: {board[i,j]}")

    for i in range(0, 100000):
        if i % 10000 == 0:
            print(i)
