/**
 * Role based Access Control Config
 * @export {AccessControl}
 * @version 0.0.1
 */

const grants = {
	"guest": {
		post: {
			"read:any": ['*', '!status', '!state', '!reports']
		}
	},
	"regular": {
		post: {
			"read:any": ['*', '!status', '!state', '!reports']
		}
	},
	"owner": {
		post: {
			"read:any": ['*', '!status', '!state', '!reports']
		}
	},
	"writer": {
		post: {
			"read:own": ['*'],
			"read:any": ['*', '!status', 'state', '!reports'],
			"creat:own": ['*'],
			"update:own": ['*'],
			"delete:own": ['*'],
		}
	},
	"manager": {
		post: {
			post: {
				"read:any": ['*'],
				"creat:own": ['*'],
				"update:own": ['*'],
				"update:any": ['status', 'state', 'reports'],
				"delete:own": ['*'],
			}
		}
	},
	"admin": {
		post: {
			post: {
				"read:any": ['*'],
				"creat:own": ['*'],
				"update:own": ['*'],
				"update:any": ['status', 'state', 'reports'],
				"delete:own": ['*'],
			}
		}
	},
	"god": {
		post: {
			"read:any": ['*'],
			"update:any": ['status', 'state', 'reports'],
		}
	}
};

export default grants;
